// The article reader's pure half (BlogListen): which browser voice reads, and how the text is
// cut into utterances. Checked by scripts/speech.test.ts.

type Voice = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'default'>

// macOS ships joke voices (Albert, Zarvox…) under names localized with the system, and the
// Eloquence ones, "Eddy (French (France))", that sound like a 90s modem: both come last
const JOKE_VOICE =
  /^(albert|bahh|bells|cloches|boing|bubbles|bulles|cellos|violoncelles|bad news|mauvaises nouvelles|good news|bonnes nouvelles|jester|bouffon|organ|orgue|superstar|trinoids|trinoïdes|whisper|murmure|wobble|zarvox|fred|junior|kathy|ralph)$/i

function rank(voice: Voice) {
  // Edge's neural voices, "Microsoft Denise Online (Natural) - French (France)"
  if (/natural|online/i.test(voice.name)) return 0
  // Chrome's network voices, "Google français"
  if (/google/i.test(voice.name)) return 1
  // Apple voices downloaded in the system settings
  if (/premium|enhanced|améliorée?/i.test(voice.name)) return 2
  if (JOKE_VOICE.test(voice.name)) return 6
  if (/\(.*\(/.test(voice.name)) return 5
  return voice.default ? 3 : 4
}

/** The cleanest voice the browser has in `lang` ('fr', 'en'), or undefined if none */
export function pickVoice<V extends Voice>(voices: readonly V[], lang: string): V | undefined {
  return (
    voices
      // Edge 150 lists every natural voice as "Microsoft undefined Online (Natural) - undefined"
      .filter(
        (v) => v.lang.toLowerCase().split(/[-_]/)[0] === lang && !v.name.includes('undefined'),
      )
      .sort((a, b) => rank(a) - rank(b))[0]
  )
}

// Chrome stops a Google voice about 15s into one utterance (Chromium 679437): a long sentence
// is cut again after its commas, semicolons and colons.
// ponytail: a 200+ character run without any of them stays whole; cut on spaces if one shows up.
const MAX_UTTERANCE = 200

/** One utterance per sentence, long sentences cut after their punctuation */
export function splitSentences(text: string, lang: string): string[] {
  const sentences =
    typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter(lang, { granularity: 'sentence' }).segment(text), (s) =>
          s.segment.trim(),
        )
      : [text.trim()]
  return sentences.flatMap(cutLong).filter(Boolean)
}

function cutLong(sentence: string): string[] {
  if (sentence.length <= MAX_UTTERANCE) return [sentence]
  const parts: string[] = []
  let part = ''
  for (const piece of sentence.split(/(?<=[,;:])\s+/)) {
    if (part && part.length + 1 + piece.length > MAX_UTTERANCE) {
      parts.push(part)
      part = piece
    } else part = part ? `${part} ${piece}` : piece
  }
  return [...parts, part]
}
