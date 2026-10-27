// Check de server/utils/githubActivity.ts — la lecture des événements GitHub publics que
// montre /activity. Un pli mal borné avale les pushes d'un autre jour ou d'une autre
// branche, un filtre trop large remplit le flux de libellés et de branches créées.
//
// usage: bun scripts/github-activity.test.ts
import assert from 'node:assert/strict'
import { toActivities, type GitHubEvent } from '../server/utils/githubActivity'

let n = 0
const event = (
  type: string,
  at: string,
  payload: GitHubEvent['payload'],
  repo = 'kbrdn1/gwm-cli',
) => ({ id: String(++n), type, created_at: at, repo: { name: repo }, payload }) as GitHubEvent

const issue = { number: 7, title: 'Bug', html_url: 'https://github.com/kbrdn1/gwm-cli/issues/7' }

const feed = toActivities([
  // Three pushes to main on the 26th fold into one, though the API lists one of them out of
  // order; the one to dev and the one of the 25th don't
  event('PushEvent', '2026-10-26T11:00:00Z', { ref: 'refs/heads/main' }),
  event('PushEvent', '2026-10-26T12:00:00Z', { ref: 'refs/heads/main' }),
  event('PushEvent', '2026-10-26T10:00:00Z', { ref: 'refs/heads/main' }),
  event('PushEvent', '2026-10-26T09:00:00Z', { ref: 'refs/heads/dev' }),
  event('PushEvent', '2026-10-25T23:00:00Z', { ref: 'refs/heads/dev' }),
  // Noise: a label, a branch creation, an unknown type
  event('IssuesEvent', '2026-10-25T22:00:00Z', { action: 'labeled', issue }),
  event('CreateEvent', '2026-10-25T21:00:00Z', { ref: 'feat/x', ref_type: 'branch' }),
  event('DeleteEvent', '2026-10-25T20:00:00Z', {}),
  // Kept: a merged PR (no title in the payload), an opened issue, two comments on it
  event('PullRequestEvent', '2026-10-25T19:00:00Z', { action: 'merged', number: 703 }),
  event('IssuesEvent', '2026-10-25T18:00:00Z', { action: 'opened', issue }),
  event('IssueCommentEvent', '2026-10-25T17:00:00Z', { action: 'created', issue }),
  event('IssueCommentEvent', '2026-10-25T16:00:00Z', { action: 'created', issue }),
  // Someone else's repository keeps its owner; a tag and a star
  event(
    'PullRequestEvent',
    '2026-10-24T10:00:00Z',
    { action: 'opened', number: 9 },
    'NixOS/nixpkgs',
  ),
  event('CreateEvent', '2026-10-24T09:00:00Z', { ref: 'v1.11.0', ref_type: 'tag' }),
  event('WatchEvent', '2026-10-24T08:00:00Z', { action: 'started' }, 'hardbeat920/monocode'),
])

assert.deepEqual(
  feed.map((a) => [a.type, a.repo, a.count, a.ref ?? a.action ?? '']),
  [
    ['push', 'gwm-cli', 3, 'main'],
    ['push', 'gwm-cli', 1, 'dev'],
    ['push', 'gwm-cli', 1, 'dev'],
    ['pr', 'gwm-cli', 1, 'merged'],
    ['issue', 'gwm-cli', 1, 'opened'],
    ['comment', 'gwm-cli', 2, ''],
    ['pr', 'NixOS/nixpkgs', 1, 'opened'],
    ['create', 'gwm-cli', 1, 'v1.11.0'],
    ['star', 'hardbeat920/monocode', 1, ''],
  ],
)
// A folded entry keeps its latest time; a PR links to its page, without a title
assert.equal(feed[0]!.at, '2026-10-26T12:00:00Z')
assert.equal(feed[3]!.url, 'https://github.com/kbrdn1/gwm-cli/pull/703')
assert.equal(feed[3]!.title, undefined)
assert.equal(feed[0]!.url, 'https://github.com/kbrdn1/gwm-cli/tree/main')

console.log('github-activity: ok')
