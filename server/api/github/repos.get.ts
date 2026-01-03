import { defineEventHandler, getQuery, setResponseHeader } from 'h3'

interface RepoLanguages {
  [key: string]: number
}

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  pushed_at: string
  created_at: string
}

interface RepoStats {
  name: string
  description: string
  url: string
  homepage: string | null
  stars: number
  forks: number
  watchers: number
  issues: number
  language: string | null
  topics: string[]
  languages: { name: string; percentage: number; color: string }[]
  lastPush: string
  createdAt: string
}

// GitHub language colors
const languageColors: Record<string, string> = {
  'TypeScript': '#3178C6',
  'JavaScript': '#F7DF1E',
  'Vue': '#42B883',
  'Go': '#00ADD8',
  'Rust': '#DEA584',
  'Python': '#3776AB',
  'PHP': '#777BB4',
  'HTML': '#E34C26',
  'CSS': '#563D7C',
  'SCSS': '#C6538C',
  'Shell': '#89E051',
  'Dockerfile': '#384D54',
  'Makefile': '#427819',
  'MDX': '#FCB32C',
  'Astro': '#FF5D01',
  'Svelte': '#FF3E00',
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const username = (query.username as string) || 'kbrdn1'
  const repos = (query.repos as string)?.split(',') || []

  const token = config.githubToken
  const isValidToken = token &&
    !token.includes('xxxx') &&
    (token.startsWith('ghp_') || token.startsWith('github_pat_')) &&
    token.length > 20

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'kbrdn.dev-portfolio'
  }

  if (isValidToken) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const repoStats: RepoStats[] = []

    for (const repoName of repos) {
      try {
        // Fetch repo info
        const repoResponse = await $fetch<GitHubRepo>(
          `https://api.github.com/repos/${username}/${repoName}`,
          { headers }
        )

        // Fetch languages
        const languagesResponse = await $fetch<RepoLanguages>(
          `https://api.github.com/repos/${username}/${repoName}/languages`,
          { headers }
        )

        // Calculate language percentages
        const totalBytes = Object.values(languagesResponse).reduce((a, b) => a + b, 0)
        const languages = Object.entries(languagesResponse)
          .map(([name, bytes]) => ({
            name,
            percentage: Math.round((bytes / totalBytes) * 100),
            color: languageColors[name] || '#8B8B8B'
          }))
          .filter(lang => lang.percentage >= 5) // Only show languages with >= 5%
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 4) // Max 4 languages

        repoStats.push({
          name: repoResponse.name,
          description: repoResponse.description || '',
          url: repoResponse.html_url,
          homepage: repoResponse.homepage,
          stars: repoResponse.stargazers_count,
          forks: repoResponse.forks_count,
          watchers: repoResponse.watchers_count,
          issues: repoResponse.open_issues_count,
          language: repoResponse.language,
          topics: repoResponse.topics || [],
          languages,
          lastPush: repoResponse.pushed_at,
          createdAt: repoResponse.created_at
        })
      } catch (error) {
        console.error(`Failed to fetch repo ${repoName}:`, error)
        // Continue with other repos
      }
    }

    // Cache for 1 hour
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

    return repoStats
  } catch (error) {
    console.error('GitHub API error:', error)
    return []
  }
})
