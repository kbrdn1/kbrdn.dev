import { createError } from 'h3'
import { toActivities, type GitHubEvent } from '../../utils/githubActivity'

// Recent public GitHub activity for /activity: the last 100 public events of kbrdn1, read
// by toActivities (server/utils/githubActivity.ts). Cached 10 minutes server side under one
// key whatever the query string, so a made-up `?x=` neither skips the cache nor adds an
// entry, and the unauthenticated limit (60 requests an hour) is never reached; `checkedAt`
// says when.

export default defineCachedEventHandler(
  async () => {
    const token = githubToken()
    const events = await $fetch<GitHubEvent[]>(
      'https://api.github.com/users/kbrdn1/events/public?per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'kbrdn.dev-portfolio',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    ).catch((error) => {
      console.error('GitHub events request failed:', error)
      throw createError({ statusCode: 502, statusMessage: 'GitHub API error' })
    })

    return { checkedAt: new Date().toISOString(), items: toActivities(events) }
  },
  { maxAge: 600, name: 'github-activity', getKey: () => 'events' },
)
