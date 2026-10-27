// Public GitHub events read as a portfolio feed: the noise dropped (labels, assignments,
// branch creations, deletions), consecutive pushes to one branch on one day folded into a
// single entry, everything reduced to what the page states. Since 2025 the events API trims
// its payloads: a PushEvent has no commit count, a PullRequestEvent no title nor page URL,
// so neither is promised here.

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    action?: string
    ref?: string | null
    ref_type?: string
    number?: number
    issue?: { number: number; title: string; html_url: string; pull_request?: unknown }
    comment?: { html_url: string }
    release?: { tag_name: string; name?: string | null; html_url: string }
    forkee?: { full_name: string; html_url: string }
  }
}

export type ActivityType =
  | 'push'
  | 'pr'
  | 'issue'
  | 'comment'
  | 'release'
  | 'create'
  | 'star'
  | 'fork'

export interface Activity {
  id: string
  type: ActivityType
  /** opened, closed, merged, reopened (pr, issue); repository or tag (create) */
  action?: string
  /** `name` for my own repositories, `owner/name` for the others */
  repo: string
  url: string
  /** Latest event of the entry, ISO 8601 */
  at: string
  /** Events folded into the entry: pushes to a branch, comments on an issue */
  count: number
  /** Branch (push), tag (create, release) */
  ref?: string
  number?: number
  title?: string
}

const OWNER = 'kbrdn1'
const KEPT_ACTIONS = new Set(['opened', 'closed', 'merged', 'reopened'])

const repoName = (full: string) =>
  full.startsWith(`${OWNER}/`) ? full.slice(OWNER.length + 1) : full
const branch = (ref?: string | null) => ref?.replace(/^refs\/(heads|tags)\//, '') ?? ''
const day = (iso: string) => iso.slice(0, 10)

function toActivity(event: GitHubEvent): Activity | null {
  const { payload: p, repo, created_at: at, id } = event
  const base = {
    id,
    repo: repoName(repo.name),
    at,
    count: 1,
    url: `https://github.com/${repo.name}`,
  }

  switch (event.type) {
    case 'PushEvent':
      return { ...base, type: 'push', ref: branch(p.ref), url: `${base.url}/tree/${branch(p.ref)}` }
    case 'PullRequestEvent':
      if (!p.action || !KEPT_ACTIONS.has(p.action) || !p.number) return null
      return {
        ...base,
        type: 'pr',
        action: p.action,
        number: p.number,
        url: `${base.url}/pull/${p.number}`,
      }
    case 'IssuesEvent':
      if (!p.action || !KEPT_ACTIONS.has(p.action) || !p.issue) return null
      return {
        ...base,
        type: 'issue',
        action: p.action,
        number: p.issue.number,
        title: p.issue.title,
        url: p.issue.html_url,
      }
    case 'IssueCommentEvent':
      if (p.action !== 'created' || !p.issue) return null
      return {
        ...base,
        type: 'comment',
        number: p.issue.number,
        title: p.issue.title,
        url: p.comment?.html_url ?? p.issue.html_url,
      }
    case 'ReleaseEvent':
      if (p.action !== 'published' || !p.release) return null
      return { ...base, type: 'release', ref: p.release.tag_name, url: p.release.html_url }
    case 'CreateEvent':
      // A branch shows up through its pushes
      if (p.ref_type !== 'repository' && p.ref_type !== 'tag') return null
      return { ...base, type: 'create', action: p.ref_type, ref: p.ref ?? undefined }
    case 'WatchEvent':
      return { ...base, type: 'star' }
    case 'ForkEvent':
      return p.forkee ? { ...base, type: 'fork', url: p.forkee.html_url } : null
    default:
      return null
  }
}

/** Entries newest first. The API lists events in the order it received them, which is not
    their creation order (a push can land hours late): sorted first, so days and runs hold. */
export function toActivities(events: GitHubEvent[]): Activity[] {
  const out: Activity[] = []
  const sorted = [...events].sort((a, b) => b.created_at.localeCompare(a.created_at))
  for (const event of sorted) {
    const entry = toActivity(event)
    if (!entry) continue
    const last = out.at(-1)
    // Fold a run of pushes to one branch, or of comments on one issue, within a day
    const folds =
      last &&
      last.type === entry.type &&
      last.repo === entry.repo &&
      day(last.at) === day(entry.at) &&
      ((entry.type === 'push' && last.ref === entry.ref) ||
        (entry.type === 'comment' && last.number === entry.number))
    if (folds) last.count++
    else out.push(entry)
  }
  return out
}
