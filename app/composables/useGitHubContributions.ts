interface ContributionDay {
  contributionCount: number
  date: string
  color: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface YearlyContributions {
  year: number
  totalContributions: number
  weeks: ContributionWeek[]
}

interface ContributionCalendar {
  totalContributions: number
  years: YearlyContributions[]
  // Rolling year ending today, the calendar GitHub shows on a profile.
  recent: { totalContributions: number; weeks: ContributionWeek[] }
}

export function useGitHubContributions(username: string = 'kbrdn1', years: number = 5) {
  return useAsyncData<ContributionCalendar>(
    `github-contributions-${username}-${years}`,
    () =>
      $fetch('/api/github/contributions', {
        query: { username, years },
      }),
    // Client-side and lazy: the yearly GraphQL calls would hold up the server render and the
    // navigation; the chart renders its skeleton meanwhile.
    {
      server: false,
      lazy: true,
    },
  )
}
