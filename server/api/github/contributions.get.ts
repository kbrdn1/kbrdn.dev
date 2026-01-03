import { defineEventHandler, getQuery, setResponseHeader, createError } from 'h3'

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
}

interface GitHubResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: ContributionWeek[]
        }
      }
    }
  }
  errors?: Array<{ message: string }>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const username = (query.username as string) || 'kbrdn1'
  const yearsToFetch = Math.min(parseInt(query.years as string) || 5, 10) // Max 10 years

  // Check for GitHub token (support both classic ghp_ and fine-grained github_pat_ tokens)
  const token = config.githubToken
  const isValidToken = token &&
    !token.includes('xxxx') &&
    (token.startsWith('ghp_') || token.startsWith('github_pat_')) &&
    token.length > 20

  if (!isValidToken) {
    // Return mock data if no valid token (for development)
    console.warn('No valid GitHub token found, using mock data')
    return generateMockData(yearsToFetch)
  }

  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years: YearlyContributions[] = []
    let totalContributions = 0

    // Fetch data for each calendar year
    for (let i = 0; i < yearsToFetch; i++) {
      const year = currentYear - i
      // For current year: January 1 to now
      // For past years: January 1 to December 31
      const from = new Date(year, 0, 1)
      const to = i === 0
        ? now
        : new Date(year, 11, 31, 23, 59, 59)

      // Skip years before GitHub account creation (approximate)
      if (year < 2008) break

      const response = await $fetch<GitHubResponse>('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          query: `
            query($username: String!, $from: DateTime!, $to: DateTime!) {
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
            from: from.toISOString(),
            to: to.toISOString()
          }
        }
      })

      if (response.errors) {
        console.error('GitHub API errors:', response.errors)
        continue
      }

      if (!response.data?.user) {
        console.error('GitHub user not found:', username)
        break
      }

      const calendar = response.data.user.contributionsCollection.contributionCalendar

      // Skip years with no contributions
      if (calendar.totalContributions === 0 && i > 0) continue

      years.push({
        year,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks
      })

      totalContributions += calendar.totalContributions
    }

    // Cache for 1 hour
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

    return {
      totalContributions,
      years
    }
  } catch (error) {
    console.error('GitHub API error:', error)
    // Return mock data on error
    return generateMockData(yearsToFetch)
  }
})

// Generate mock contribution data for development/fallback
function generateMockData(yearsCount: number): ContributionCalendar {
  const now = new Date()
  const currentYear = now.getFullYear()
  const years: YearlyContributions[] = []
  let totalContributions = 0

  for (let y = 0; y < yearsCount; y++) {
    const year = currentYear - y
    const weeks: ContributionWeek[] = []

    // For current year: January 1 to now
    // For past years: January 1 to December 31
    const startDate = new Date(year, 0, 1)
    const endDate = y === 0 ? now : new Date(year, 11, 31)

    // Start from the Sunday of the start week
    const current = new Date(startDate)
    current.setDate(current.getDate() - current.getDay())

    let yearTotal = 0

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

        yearTotal += count

        contributionDays.push({
          contributionCount: count,
          date: currentDate.toISOString().split('T')[0],
          color: getContributionColor(count)
        })
      }

      if (contributionDays.length > 0) {
        weeks.push({ contributionDays })
      }

      current.setDate(current.getDate() + 7)
    }

    years.push({
      year,
      totalContributions: yearTotal,
      weeks
    })

    totalContributions += yearTotal
  }

  return { totalContributions, years }
}

function getContributionColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count <= 3) return '#9be9a8'
  if (count <= 6) return '#40c463'
  if (count <= 9) return '#30a14e'
  return '#216e39'
}
