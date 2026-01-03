interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface YearlyContributions {
  year: number;
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface ContributionCalendar {
  totalContributions: number;
  years: YearlyContributions[];
}

export function useGitHubContributions(username: string = "kbrdn1", years: number = 5) {
  return useAsyncData<ContributionCalendar>(
    `github-contributions-${username}-${years}`,
    () =>
      $fetch("/api/github/contributions", {
        query: { username, years },
      }),
    {
      server: true,
      lazy: false,
    },
  );
}
