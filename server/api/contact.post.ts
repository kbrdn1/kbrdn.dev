import { defineEventHandler, readBody, createError, getHeader } from 'h3'

interface ContactForm {
  name: string
  email: string
  message: string
  /** Optional, from /contact */
  company?: string
  topic?: string
  /** The Cloudflare Turnstile token of the widget on /contact */
  turnstileToken?: string
}

// The topics /contact offers; anything else is dropped
const TOPICS = new Set(['role', 'project', 'openSource', 'other'])
// 2048: the longest token Turnstile issues
const MAX = { name: 200, email: 320, company: 200, message: 5000, turnstileToken: 2048 }

// Every field ends up in an HTML email: escaped, so a message cannot inject markup into it
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactForm>(event)

  // Validate required fields
  if (!body?.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  // A crafted request can send arrays or objects: every field must be a string
  const optional = [body.company, body.topic, body.turnstileToken].filter((v) => v != null)
  if (![body.name, body.email, body.message, ...optional].every((v) => typeof v === 'string')) {
    throw createError({ statusCode: 400, message: 'Invalid field type' })
  }

  // Lengths first: the email pattern backtracks quadratically, so an unbounded address would
  // hold the event loop for seconds before being turned down
  if (
    body.name.length > MAX.name ||
    body.email.length > MAX.email ||
    body.message.length > MAX.message ||
    (body.company?.length ?? 0) > MAX.company ||
    (body.turnstileToken?.length ?? 0) > MAX.turnstileToken
  ) {
    throw createError({ statusCode: 400, message: 'Field too long' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email format',
    })
  }

  // Cloudflare Turnstile, after the cheap checks: a token is single-use, a request turned down
  // above must not spend it. Fails closed: without the secret nothing is sent, a form open to
  // bots is what this check exists to close. Read from process.env too, for the same reason as
  // the Resend key below (the image is built without it).
  const turnstileSecret = useRuntimeConfig().turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY
  if (!turnstileSecret) {
    console.error('TURNSTILE_SECRET_KEY is not set: contact form submission refused')
    throw createError({ statusCode: 503, message: 'Contact form unavailable' })
  }
  if (!body.turnstileToken) {
    throw createError({ statusCode: 403, message: 'Captcha required' })
  }
  const outcome = await $fetch<{ success: boolean; 'error-codes'?: string[] }>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: {
        secret: turnstileSecret,
        response: body.turnstileToken,
        // Set by Cloudflare's proxy in front of the site; only a hint to the check, a forged
        // value cannot turn an invalid token into a valid one
        remoteip: getHeader(event, 'cf-connecting-ip'),
      },
    },
  ).catch((error) => {
    console.error('Turnstile siteverify unreachable:', error)
    return { success: false, 'error-codes': ['siteverify-unreachable'] }
  })
  if (!outcome.success) {
    console.warn('Turnstile check failed:', outcome['error-codes'])
    throw createError({ statusCode: 403, message: 'Captcha failed' })
  }

  const name = escapeHtml(body.name)
  const company = body.company ? escapeHtml(body.company) : ''
  const topic = body.topic && TOPICS.has(body.topic) ? body.topic : ''

  // runtimeConfig.resendApiKey is frozen at build time (nuxt.config reads process.env then) and
  // the image is built without it; the container gets RESEND_API_KEY at run time, which Nuxt
  // only maps from NUXT_RESEND_API_KEY. Read it here too, or every message only gets logged.
  const resendApiKey = useRuntimeConfig().resendApiKey || process.env.RESEND_API_KEY

  try {
    // Send email via Resend if API key is configured
    if (resendApiKey) {
      await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          from: 'contact@email.kbrdn.dev',
          to: 'hello@kbrdn.dev',
          reply_to: body.email,
          subject: `New contact from ${body.name}${topic ? ` (${topic})` : ''}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${topic ? `<p><strong>Topic:</strong> ${topic}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>
          `,
        },
      })
    } else {
      // Log to console if no email service configured
      console.log('📧 New contact form submission:')
      console.log(`Name: ${body.name}`)
      console.log(`Email: ${body.email}`)
      if (company) console.log(`Company: ${body.company}`)
      if (topic) console.log(`Topic: ${topic}`)
      console.log(`Message: ${body.message}`)
    }

    return { success: true }
  } catch (error) {
    // Surface the real Resend error (status + response body) server-side:
    // $fetch/ofetch puts the parsed API response under `.data` and the HTTP
    // status under `.status`. The generic message is all the client gets.
    const status = (error as { status?: number })?.status
    const detail = (error as { data?: unknown })?.data ?? error
    console.error(`Failed to send contact email (status: ${status ?? 'n/a'}):`, detail)
    throw createError({
      statusCode: 500,
      message: 'Failed to send message',
    })
  }
})
