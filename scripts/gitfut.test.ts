// Check de shared/gitfut.ts : la carte gitfut lue pour l'easter egg du hero. gitfut est un
// tiers : un champ hors bornes doit lever (la route garde alors la dernière bonne carte).
//
// usage: bun scripts/gitfut.test.ts
import assert from 'node:assert/strict'
import { toGitfutCard } from '../shared/gitfut'

// What gitfut answered on 2026-10-29, trimmed to the fields read and a few it carries
const payload = {
  login: 'kbrdn1',
  name: 'Kylian Bardini',
  avatarUrl:
    'https://avatars.githubusercontent.com/u/94058709?s=480&u=c5b3b40f9080505646468991e140e9573b782898&v=4',
  country: 'fr',
  club: 'neutral',
  stats: { pac: 77, sho: 63, pas: 83, dri: 75, def: 61, phy: 94 },
  position: 'CM',
  overall: 84,
  finish: 'totw',
  finishLabel: 'IN-FORM',
  topLanguage: 'TypeScript',
  languageLogo: { name: 'TypeScript', slug: 'typescript-original' },
  years: [{ year: 2026, commits: 3144 }],
}

const card = toGitfutCard(payload)
assert.deepEqual(card, {
  name: 'Kylian Bardini',
  overall: 84,
  position: 'CM',
  country: 'fr',
  language: 'TypeScript',
  finish: 'totw',
  stats: { pac: 77, sho: 63, pas: 83, dri: 75, def: 61, phy: 94 },
})

// The login when there is no name
assert.equal(toGitfutCard({ ...payload, name: null }).name, 'kbrdn1')
// No country, no language: the egg skips those beats
assert.equal(toGitfutCard({ ...payload, country: null }).country, null)
assert.equal(
  toGitfutCard({ ...payload, languageLogo: undefined, topLanguage: undefined }).language,
  null,
)

// Anything off throws
const off: Record<string, unknown>[] = [
  { overall: 150 },
  { overall: '84' },
  { position: '<b>' },
  { country: 'fra' },
  { finish: 'Gold Rare!' },
  { stats: { ...payload.stats, phy: 0 } },
  { stats: undefined },
  { name: '   ', login: undefined },
  { languageLogo: { name: '<img src=x>' } },
]
for (const patch of off) assert.throws(() => toGitfutCard({ ...payload, ...patch }), /gitfut/)
assert.throws(() => toGitfutCard(null), /gitfut/)
assert.throws(() => toGitfutCard('{}'), /gitfut/)

console.log('gitfut card: ok')
