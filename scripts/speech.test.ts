// Check de app/utils/speech.ts : la voix qui lit l'article et le découpage en énoncés.
// Une voix mal classée fait lire l'article par Zarvox ou par une voix Eloquence sans casser
// ni le typecheck ni le build ; un énoncé trop long se coupe net au bout de ~15 s sur les
// voix Google de Chrome.
//
// usage: bun scripts/speech.test.ts
import assert from 'node:assert/strict'
import { pickVoice, splitSentences } from '../app/utils/speech'

const voice = (name: string, lang: string, isDefault = false) => ({
  name,
  lang,
  default: isDefault,
})

// Les voix françaises que Helium (Chromium 156, macOS) expose réellement, le 2026-10-28.
const helium = [
  voice('Thomas', 'fr-FR', true),
  voice('Albert', 'en-US'),
  voice('Amélie', 'fr-CA'),
  voice('Bahh', 'en-US'),
  voice('Daniel', 'en-GB'),
  voice('Eddy (français (France))', 'fr-FR'),
  voice('Grandma (anglais (Royaume-Uni))', 'en-GB'),
  voice('Jacques', 'fr-FR'),
  voice('Samantha', 'en-US'),
  voice('Zarvox', 'en-US'),
]
assert.equal(pickVoice(helium, 'fr')?.name, 'Thomas')
// En anglais, ni la voix gag listée en premier, ni une voix Eloquence.
assert.equal(pickVoice(helium, 'en')?.name, 'Daniel')
assert.equal(pickVoice(helium, 'de'), undefined)
assert.equal(pickVoice([], 'fr'), undefined)

// Les voix neuronales d'Edge, puis les voix réseau de Chrome, passent devant les voix système.
const edge = [
  voice('Microsoft Paul - French (France)', 'fr-FR', true),
  voice('Google français', 'fr-FR'),
  voice('Microsoft Denise Online (Natural) - French (France)', 'fr-FR'),
]
assert.equal(pickVoice(edge, 'fr')?.name, 'Microsoft Denise Online (Natural) - French (France)')
assert.equal(pickVoice(edge.slice(0, 2), 'fr')?.name, 'Google français')
assert.equal(
  pickVoice([voice('Thomas', 'fr-FR'), voice('Audrey (Premium)', 'fr-FR')], 'fr')?.name,
  'Audrey (Premium)',
)
// Edge 150 : entrées « undefined » écartées ; Android : « fr_FR ».
assert.equal(
  pickVoice(
    [voice('Microsoft undefined Online (Natural) - undefined', 'fr-FR'), voice('Thomas', 'fr-FR')],
    'fr',
  )?.name,
  'Thomas',
)
assert.equal(pickVoice([voice('Français', 'fr_FR')], 'fr')?.name, 'Français')

// Une phrase, un énoncé.
assert.deepEqual(splitSentences('Bonjour. Ça va ? Oui, très bien !', 'fr'), [
  'Bonjour.',
  'Ça va ?',
  'Oui, très bien !',
])
assert.deepEqual(splitSentences('  ', 'fr'), [])

// Une phrase longue est recoupée après sa ponctuation, sans perdre un mot.
const long =
  Array.from({ length: 12 }, (_, i) => `la proposition numéro ${i} qui s'allonge`).join(', ') + '.'
const cut = splitSentences(long, 'fr')
assert.ok(cut.length > 1)
assert.ok(cut.every((s) => s.length <= 200))
assert.equal(cut.join(' '), long)

console.log('speech: ok')
