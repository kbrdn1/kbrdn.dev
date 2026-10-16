import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'

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

interface Calendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

interface ContributionCalendar {
  totalContributions: number
  years: YearlyContributions[]
  // Rolling year ending today, the calendar GitHub shows on a profile.
  recent: Calendar
}

interface GitHubResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: Calendar
      }
    } | null
  }
  errors?: Array<{ message: string }>
}

// Without `from`/`to`, GitHub returns the year ending today.
async function fetchCalendar(
  username: string,
  token: string,
  from?: Date,
  to?: Date,
): Promise<Calendar | null> {
  const response = await $fetch<GitHubResponse>('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: {
      query: `
        query($username: String!, $from: DateTime, $to: DateTime) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        username,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
      },
    },
  })

  if (response.errors) {
    console.error('GitHub API errors:', response.errors)
    return null
  }
  return response.data?.user?.contributionsCollection.contributionCalendar ?? null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const username = (query.username as string) || 'kbrdn1'
  const yearsToFetch = Math.min(parseInt(query.years as string) || 5, 10) // Max 10 years

  const token = githubToken()
  if (!token) {
    // Random data so the chart renders in development; production must not invent activity.
    if (import.meta.dev) return generateMockData(yearsToFetch)
    throw createError({ statusCode: 503, statusMessage: 'GitHub token not configured' })
  }

  try {
    const recent = await fetchCalendar(username, token)
    if (!recent) throw new Error(`No contribution calendar for ${username}`)

    const now = new Date()
    const currentYear = now.getFullYear()
    const years: YearlyContributions[] = []
    let totalContributions = 0

    // Fetch data for each calendar year
    for (let i = 0; i < yearsToFetch; i++) {
      const year = currentYear - i
      // Skip years before GitHub existed
      if (year < 2008) break

      // Current year: January 1 to now; past years: January 1 to December 31
      const calendar = await fetchCalendar(
        username,
        token,
        new Date(year, 0, 1),
        i === 0 ? now : new Date(year, 11, 31, 23, 59, 59),
      )
      if (!calendar) continue

      // Skip years with no contributions
      if (calendar.totalContributions === 0 && i > 0) continue

      years.push({ year, totalContributions: calendar.totalContributions, weeks: calendar.weeks })
      totalContributions += calendar.totalContributions
    }

    // Cache for 1 hour
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

    return { totalContributions, years, recent } satisfies ContributionCalendar
  } catch (error) {
    console.error('GitHub API error:', error)
    if (import.meta.dev) return generateMockData(yearsToFetch)
    throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
  }
})

// Random contribution weeks between two dates, starting on the Sunday of the first week.
function mockWeeks(startDate: Date, endDate: Date): Calendar {
  const weeks: ContributionWeek[] = []
  const current = new Date(startDate)
  current.setDate(current.getDate() - current.getDay())
  let totalContributions = 0

  while (current <= endDate) {
    const contributionDays: ContributionDay[] = []

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(current)
      currentDate.setDate(current.getDate() + day)

      // Skip dates outside range
      if (currentDate < startDate || currentDate > endDate) continue

      // Generate random contribution count
      const random = Math.random()
      let count = 0
      if (random > 0.3) count = 0
      else if (random > 0.15) count = Math.floor(Math.random() * 3) + 1
      else if (random > 0.05) count = Math.floor(Math.random() * 5) + 3
      else count = Math.floor(Math.random() * 10) + 7

      totalContributions += count

      contributionDays.push({
        contributionCount: count,
        date: currentDate.toISOString().slice(0, 10),
        color: getContributionColor(count),
      })
    }

    if (contributionDays.length > 0) {
      weeks.push({ contributionDays })
    }

    current.setDate(current.getDate() + 7)
  }

  return { totalContributions, weeks }
}

// Generate mock contribution data for development
function generateMockData(yearsCount: number): ContributionCalendar {
  const now = new Date()
  const currentYear = now.getFullYear()
  const years: YearlyContributions[] = []
  let totalContributions = 0

  for (let y = 0; y < yearsCount; y++) {
    const year = currentYear - y
    // Current year: January 1 to now; past years: January 1 to December 31
    const calendar = mockWeeks(new Date(year, 0, 1), y === 0 ? now : new Date(year, 11, 31))
    years.push({ year, ...calendar })
    totalContributions += calendar.totalContributions
  }

  const yearAgo = new Date(now)
  yearAgo.setDate(yearAgo.getDate() - 364)
  return { totalContributions, years, recent: mockWeeks(yearAgo, now) }
}

function getContributionColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count <= 3) return '#9be9a8'
  if (count <= 6) return '#40c463'
  if (count <= 9) return '#30a14e'
  return '#216e39'
}
