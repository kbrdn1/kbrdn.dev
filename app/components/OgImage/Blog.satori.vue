<script setup lang="ts">
// An article's OG image: the blog's card (pages/blog, cards view) on the blog's dither field.
// The banner full width on top, the card over its bottom edge (the first tag and the
// reading time, the title, the summary, then the date and the tags between dashed rules),
// the call to read in the footer.
// Satori: every style on one line (its gradient parser fails on split values), every box
// with several children a flex box.
const TAG_COLORS: Record<string, { color: string, border: string, bg: string }> = {
  go: { color: '#22d3ee', border: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.12)' },
  rust: { color: '#fb923c', border: 'rgba(251,146,60,0.35)', bg: 'rgba(251,146,60,0.12)' },
  nuxt: { color: '#4ade80', border: 'rgba(74,222,128,0.35)', bg: 'rgba(74,222,128,0.12)' },
  laravel: { color: '#f87171', border: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.12)' },
  typescript: { color: '#60a5fa', border: 'rgba(96,165,250,0.35)', bg: 'rgba(96,165,250,0.12)' },
  'open-source': { color: '#c084fc', border: 'rgba(192,132,252,0.35)', bg: 'rgba(192,132,252,0.12)' },
  project: { color: '#e8a573', border: 'rgba(232,165,115,0.35)', bg: 'rgba(232,165,115,0.12)' },
  career: { color: '#fbbf24', border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.12)' },
  tui: { color: '#a78bfa', border: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.12)' },
  dotfiles: { color: '#a3e635', border: 'rgba(163,230,53,0.35)', bg: 'rgba(163,230,53,0.12)' },
  terminal: { color: '#34d399', border: 'rgba(52,211,153,0.35)', bg: 'rgba(52,211,153,0.12)' },
  macos: { color: '#94a3b8', border: 'rgba(148,163,184,0.35)', bg: 'rgba(148,163,184,0.12)' },
}

const FALLBACK = { color: '#7dd3fc', border: 'rgba(125,211,252,0.35)', bg: 'rgba(125,211,252,0.12)' }

function getTagColor(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] || FALLBACK
}

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  date?: string
  tags?: string[]
  minutes?: number
  bannerImage?: string
  readLabel?: string
  readingTimeLabel?: string
  tagsLabel?: string
}>(), {
  title: 'Blog Post',
  description: '',
  date: '',
  tags: () => [],
  minutes: 0,
  bannerImage: '',
  readLabel: 'Read',
  readingTimeLabel: 'min read',
  tagsLabel: 'tags',
})

// Two lines at most, cut at a word
const summary = computed(() =>
  props.description.length > 165
    ? `${props.description.slice(0, 165).replace(/\s+\S*$/, '')}…`
    : props.description,
)
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #0a0a0a;">
    <!-- The blog's dither field, frozen, with its blue (scripts/og-dither.ts) -->
    <img src="/images/og/dither-blog.png" alt="" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px;" />

    <!-- The card's panel -->
    <div class="absolute flex flex-col" style="top: 36px; bottom: 36px; left: 150px; right: 150px; overflow: hidden; background: #0f0f0f; border: 1px solid #262626; border-radius: 26px; box-shadow: 0 24px 48px -24px rgba(0,0,0,0.7);">
      <!-- The banner, full width -->
      <div class="flex" style="height: 196px; overflow: hidden; background: #141414;">
        <img v-if="bannerImage" :src="bannerImage" alt="" width="900" height="196" style="width: 900px; height: 196px; object-fit: cover;" />
      </div>

      <!-- The card over the banner's bottom edge -->
      <div class="flex flex-col flex-1" style="margin: -22px 6px 0; padding: 22px 28px 18px; background: #191919; border: 1px solid #262626; border-radius: 18px;">
        <div class="flex items-center justify-between">
          <span v-if="tags.length" :style="{ fontFamily: '\'Monaspace Krypton\', monospace', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px', borderRadius: '999px', color: getTagColor(tags[0]!).color, border: `1px solid ${getTagColor(tags[0]!).border}`, background: getTagColor(tags[0]!).bg }">
            {{ tags[0] }}
          </span>
          <span v-if="minutes" class="flex items-end" style="gap: 6px;">
            <span style="font-size: 34px; line-height: 1; color: #22c55e;">{{ minutes }}</span>
            <span style="font-size: 17px; color: #737373;">/ {{ readingTimeLabel }}</span>
          </span>
        </div>
        <h1 style="margin: 14px 0 0; font-size: 30px; line-height: 1.25; letter-spacing: -0.01em; color: #ececec;">
          {{ title }}
        </h1>
        <p v-if="description" style="margin: 8px 0 0; font-size: 16px; line-height: 1.5; color: #a3a3a3; max-height: 48px; overflow: hidden;">
          {{ summary }}
        </p>
        <!-- Date and tag count on one mono line, between dashed rules, then the other tags -->
        <div class="flex flex-col" style="margin-top: auto;">
          <div style="height: 1px; background-image: repeating-linear-gradient(90deg, #333333 0px, #333333 5px, transparent 5px, transparent 9px);" />
          <div class="flex items-center justify-between" style="padding: 10px 0;">
            <span style="font-family: 'Monaspace Krypton', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8a8a;">
              {{ date }}{{ tags.length ? ` · ${tags.length} ${tagsLabel}` : '' }}
            </span>
            <div class="flex items-center" style="gap: 6px;">
              <span
                v-for="tag in tags.slice(1, 4)"
                :key="tag"
                :style="{ fontFamily: '\'Monaspace Krypton\', monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '999px', color: getTagColor(tag).color, border: `1px solid ${getTagColor(tag).border}`, background: getTagColor(tag).bg }"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div style="height: 1px; background-image: repeating-linear-gradient(90deg, #333333 0px, #333333 5px, transparent 5px, transparent 9px);" />
        </div>
      </div>

      <!-- Footer: the blog, the call to read -->
      <div class="flex items-center justify-between" style="height: 54px; padding: 0 10px 0 18px;">
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 12px; font-weight: 700;">
          <span style="color: #7dd3fc;">blog</span><span style="color: #e5e5e5;">@</span><span style="color: #d4825d;">kbrdn1</span>
        </span>
        <span class="flex items-center" style="gap: 8px; padding: 8px 16px; font-size: 15px; color: #ffffff; background: #d4825d; border-radius: 999px;">
          {{ readLabel }}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="#ffffff">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
