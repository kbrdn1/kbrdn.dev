<script setup lang="ts">
// An article's OG image, the repos' banners' card (disarto's "Deployment" sheets) on the
// blog's dither field: two dashed construction lines along the panel's sides, nothing else
// outside it. The panel: a header (blog@kbrdn1, the window's icons), the card (the title, the
// call to read; the banner and the facts — date, reading time, tags, author; the summary after
// a dashed rule), a footer (icons, the address in mono, a button).
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
  labels?: { published: string, reading: string, tags: string, author: string }
}>(), {
  title: 'Blog Post',
  description: '',
  date: '',
  tags: () => [],
  minutes: 0,
  bannerImage: '',
  readLabel: 'Read',
  readingTimeLabel: 'min read',
  labels: () => ({ published: 'Published', reading: 'Reading', tags: 'Tags', author: 'Author' }),
})

// Two lines at most, cut at a word
const summary = computed(() =>
  props.description.length > 150
    ? `${props.description.slice(0, 150).replace(/\s+\S*$/, '')}…`
    : props.description,
)
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #0c0c0e;">
    <!-- The blog's dither field, frozen, with its blue (scripts/og-dither.ts) -->
    <img src="/images/og/dither-blog.png" alt="" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px;" />
    <!-- The construction lines, along the panel's sides -->
    <div style="position: absolute; top: 0; bottom: 0; left: 150px; width: 1px; background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 6px, transparent 6px, transparent 11px);" />
    <div style="position: absolute; top: 0; bottom: 0; left: 1049px; width: 1px; background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 6px, transparent 6px, transparent 11px);" />

    <!-- The panel, centred: its height follows its content -->
    <div class="absolute flex items-center justify-center" style="top: 0; left: 0; width: 1200px; height: 630px;">
      <div class="flex flex-col" style="width: 900px; padding: 0 6px 6px; background: #141417; border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.85);">
        <!-- Header: the blog, the window's icons -->
        <div class="flex items-center justify-between" style="height: 52px; padding: 0 12px 0 16px;">
          <span style="font-family: 'Monaspace Krypton', monospace; font-size: 16px; font-weight: 700;">
            <span style="color: #7dd3fc;">blog</span><span style="color: #ececf0;">@</span><span style="color: #d4825d;">kbrdn1</span>
          </span>
          <div class="flex" style="gap: 16px;">
            <svg v-for="name in ['expand', 'close'] as const" :key="name" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS[name]" />
          </div>
        </div>

        <!-- The card -->
        <div class="flex flex-col" style="padding: 24px 28px; background: #1b1b1f; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px;">
          <div class="flex justify-between" style="gap: 24px;">
            <h1 style="margin: 0; max-height: 78px; overflow: hidden; font-size: 32px; font-weight: 500; line-height: 1.2; letter-spacing: -0.02em; color: #ececf0;">{{ title }}</h1>
            <span class="flex items-center" style="flex-shrink: 0; gap: 7px; height: 36px; padding: 0 15px; font-size: 14px; font-weight: 500; color: #111114; background: #d4825d; border: 1px solid #d4825d; border-radius: 999px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111114" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.visit" />
              {{ readLabel }}
            </span>
          </div>

          <!-- The banner and the facts -->
          <div class="flex items-center" style="margin-top: 20px; gap: 28px;">
            <div class="flex" style="width: 290px; height: 168px; overflow: hidden; background: #0f0f12; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;">
              <img v-if="bannerImage" :src="bannerImage" alt="" width="290" height="168" style="width: 290px; height: 168px; object-fit: cover;" />
            </div>
            <div class="flex flex-col" style="gap: 9px;">
              <div v-if="date" class="flex items-center" style="min-height: 30px;">
                <span class="flex items-center" style="width: 138px; gap: 10px; font-size: 15px; color: #9a9aa3;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.calendar" />
                  {{ labels.published }}
                </span>
                <span style="font-size: 15px; color: #ececf0;">{{ date }}</span>
              </div>
              <div v-if="minutes" class="flex items-center" style="min-height: 30px;">
                <span class="flex items-center" style="width: 138px; gap: 10px; font-size: 15px; color: #9a9aa3;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.clock" />
                  {{ labels.reading }}
                </span>
                <span class="flex items-center" style="gap: 7px; height: 28px; padding: 0 12px; font-size: 13px; font-weight: 500; color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); border-radius: 999px;">
                  <span style="width: 6px; height: 6px; border-radius: 999px; background: #4ade80;" />
                  {{ minutes }} {{ readingTimeLabel }}
                </span>
              </div>
              <div v-if="tags.length" class="flex items-center" style="min-height: 30px;">
                <span class="flex items-center" style="width: 138px; gap: 10px; font-size: 15px; color: #9a9aa3;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.tag" />
                  {{ labels.tags }}
                </span>
                <div class="flex" style="gap: 6px;">
                  <span
                    v-for="tag in tags.slice(0, 3)"
                    :key="tag"
                    :style="{ display: 'flex', alignItems: 'center', height: '26px', padding: '0 10px', fontFamily: '\'Monaspace Krypton\', monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: '999px', color: getTagColor(tag).color, border: `1px solid ${getTagColor(tag).border}`, background: getTagColor(tag).bg }"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="flex items-center" style="min-height: 30px;">
                <span class="flex items-center" style="width: 138px; gap: 10px; font-size: 15px; color: #9a9aa3;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.user" />
                  {{ labels.author }}
                </span>
                <span class="flex items-center" style="gap: 6px; height: 28px; padding: 0 11px 0 3px; font-size: 14px; color: #ececf0; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px;">
                  <img src="/images/og/person.png" alt="" width="22" height="22" style="width: 22px; height: 22px; border-radius: 999px;" />
                  kbrdn1
                </span>
              </div>
            </div>
          </div>

          <!-- The summary, after a dashed rule -->
          <template v-if="description">
            <div style="height: 1px; margin: 20px 0 14px; background-image: repeating-linear-gradient(90deg, #303036 0px, #303036 6px, transparent 6px, transparent 11px);" />
            <p style="margin: 0; max-height: 44px; overflow: hidden; font-size: 15px; line-height: 1.45; color: #9a9aa3;">{{ summary }}</p>
          </template>
        </div>

        <!-- Footer: icons, the address, a button -->
        <div class="flex items-center justify-between" style="height: 52px; padding: 0 4px 0 16px;">
          <div class="flex items-center" style="gap: 16px;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.more" />
            <span style="width: 1px; height: 20px; background: #303036;" />
            <svg v-for="name in ['sparkles', 'terminal'] as const" :key="name" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS[name]" />
          </div>
          <div class="flex items-center" style="gap: 16px;">
            <span style="font-family: 'Monaspace Krypton', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #9a9aa3;">kbrdn.dev/blog</span>
            <span style="display: flex; align-items: center; height: 36px; padding: 0 16px; font-size: 14px; font-weight: 500; color: #ececf0; background: #1b1b1f; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;">kbrdn.dev</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
