import { createError, defineEventHandler, setResponseHeader } from 'h3'

// Latest published release of each app on /apps, so the page never shows a stale
// version. A fixed list: the route takes no input. GraphQL needs a token (githubToken).

const APPS = ['gwm-cli', 'vellum', 'LazyCurl'] as const

interface ReleasesResponse {
  data?: Record<string, { latestRelease: { tagName: string; publishedAt: string } | null } | null>
  errors?: Array<{ message: string }>
}

export default defineEventHandler(async (event) => {
  const token = githubToken()
  if (!token) throw createError({ statusCode: 503, statusMessage: 'GitHub token not configured' })

  // One aliased field per repository: r0, r1, …
  const fields = APPS.map(
    (name, i) =>
      `r${i}: repository(owner: "kbrdn1", name: "${name}") { latestRelease { tagName publishedAt } }`,
  ).join('\n')

  const response = await $fetch<ReleasesResponse>('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'kbrdn.dev-portfolio' },
    body: { query: `query { ${fields} }` },
  }).catch((error) => {
    console.error('GitHub releases request failed:', error)
    throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
  })

  if (response.errors?.length || !response.data) {
    console.error('GitHub releases errors:', response.errors)
    throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return Object.fromEntries(
    APPS.map((name, i) => {
      const release = response.data![`r${i}`]?.latestRelease
      return [name, release ? { version: release.tagName, publishedAt: release.publishedAt } : null]
    }),
  ) as Record<(typeof APPS)[number], { version: string; publishedAt: string } | null>
})
