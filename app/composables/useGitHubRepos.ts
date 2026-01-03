interface RepoLanguage {
  name: string
  percentage: number
  color: string
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
  languages: RepoLanguage[]
  lastPush: string
  createdAt: string
}

export function useGitHubRepos(username: string = 'kbrdn1', repos: string[] = []) {
  return useAsyncData<RepoStats[]>(
    `github-repos-${username}-${repos.join('-')}`,
    () => $fetch('/api/github/repos', {
      query: {
        username,
        repos: repos.join(',')
      }
    }),
    {
      default: () => [],
      server: false
    }
  )
}
