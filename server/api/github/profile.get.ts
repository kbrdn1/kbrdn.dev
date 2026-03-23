import { defineEventHandler, getQuery, setResponseHeader } from 'h3'

interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  avatar_url: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const username = (query.username as string) || 'kbrdn1'

  const token = config.githubToken
  const isValidToken = token &&
    !token.includes('xxxx') &&
    (token.startsWith('ghp_') || token.startsWith('github_pat_')) &&
    token.length > 20

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'kbrdn.dev-portfolio',
  }

  if (isValidToken) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const user = await $fetch<GitHubUser>(
      `https://api.github.com/users/${username}`,
      { headers },
    )

    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

    return {
      login: user.login,
      name: user.name,
      bio: user.bio,
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      avatar: user.avatar_url,
    }
  } catch (error) {
    console.error('GitHub profile API error:', error)
    return null
  }
})
