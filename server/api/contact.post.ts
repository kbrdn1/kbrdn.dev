import { defineEventHandler, readBody, createError } from 'h3'

interface ContactForm {
  name: string
  email: string
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactForm>(event)

  // Validate required fields
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email format',
    })
  }

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
          subject: `New contact from ${body.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Message:</strong></p>
            <p>${body.message.replace(/\n/g, '<br>')}</p>
          `,
        },
      })
    } else {
      // Log to console if no email service configured
      console.log('📧 New contact form submission:')
      console.log(`Name: ${body.name}`)
      console.log(`Email: ${body.email}`)
      console.log(`Message: ${body.message}`)
    }

    return { success: true }
  } catch (error) {
    // Surface the real Resend error (status + response body) server-side —
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
