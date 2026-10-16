import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'

// Pinned repositories of a GitHub profile. GraphQL only: the REST API has no pinned items,
// so this needs a token (githubToken).

interface PinnedRepository {
  name: string
  description: string | null
  url: string
  homepageUrl: string | null
  stargazerCount: number
  forkCount: number
  primaryLanguage: { name: string; color: string | null } | null
  languages: {
    totalSize: number
    edges: { size: number; node: { name: string; color: string | null } }[]
  }
}

interface PinnedResponse {
  data?: { user: { pinnedItems: { nodes: PinnedRepository[] } } | null }
  errors?: Array<{ message: string }>
}

// GitHub logins: alphanumerics and single hyphens, 39 characters at most.
const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export default defineEventHandler(async (event) => {
  const username = (getQuery(event).username as string) || 'kbrdn1'
  if (!USERNAME.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid GitHub username' })
  }

  const token = githubToken()
  if (!token) throw createError({ statusCode: 503, statusMessage: 'GitHub token not configured' })

  const response = await $fetch<PinnedResponse>('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'kbrdn.dev-portfolio' },
    body: {
      query: `
        query($username: String!) {
          user(login: $username) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  homepageUrl
                  stargazerCount
                  forkCount
                  primaryLanguage { name color }
                  languages(first: 6, orderBy: { field: SIZE, direction: DESC }) {
                    totalSize
                    edges { size node { name color } }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { username },
    },
  }).catch((error) => {
    console.error('GitHub pinned repositories request failed:', error)
    throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
  })

  if (response.errors?.length || !response.data?.user) {
    console.error('GitHub pinned repositories errors:', response.errors)
    throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return response.data.user.pinnedItems.nodes.map((repo) => ({
    name: repo.name,
    description: repo.description ?? '',
    url: repo.url,
    homepage: repo.homepageUrl || null,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    language: repo.primaryLanguage?.name ?? null,
    languageColor: repo.primaryLanguage?.color ?? null,
    // Share of the code by language, largest first (bar under each card)
    languages: repo.languages.edges.map((edge) => ({
      name: edge.node.name,
      color: edge.node.color,
      percentage: repo.languages.totalSize ? (edge.size / repo.languages.totalSize) * 100 : 0,
    })),
  }))
})
