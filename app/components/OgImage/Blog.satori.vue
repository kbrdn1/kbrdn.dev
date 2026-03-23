<script setup lang="ts">
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

withDefaults(defineProps<{
  title?: string
  description?: string
  publishedAt?: string
  tags?: string[]
  slug?: string
  bannerImage?: string
}>(), {
  title: 'Blog Post',
  description: '',
  publishedAt: '',
  tags: () => [],
  slug: '',
  bannerImage: '/images/banners/dark.jpg',
})
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #1a1a1a;">
    <!-- Grid background zones (left side) - square grid like blog page -->
    <div
      class="absolute top-0 bottom-0 left-0"
      style="width: 80px; background-image: linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px); background-size: 24px 24px; opacity: 0.6;"
    />
    <!-- Grid background zones (right side) -->
    <div
      class="absolute top-0 bottom-0 right-0"
      style="width: 80px; background-image: linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px); background-size: 24px 24px; opacity: 0.6;"
    />

    <!-- Side border lines -->
    <div class="absolute top-0 bottom-0" style="left: 80px; width: 1px; background: #2a2a2a;" />
    <div class="absolute top-0 bottom-0" style="right: 80px; width: 1px; background: #2a2a2a;" />

    <!-- Top/bottom horizontal borders -->
    <div class="absolute h-px" style="top: 48px; left: 80px; right: 80px; background: #2a2a2a;" />
    <div class="absolute h-px" style="bottom: 48px; left: 80px; right: 80px; background: #2a2a2a;" />

    <!-- Banner image fading from right -->
    <div class="absolute right-0 top-0 bottom-0" style="width: 450px;">
      <img
        :src="bannerImage"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover; opacity: 0.25;"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(to right, #1a1a1a 0%, rgba(26,26,26,0.95) 25%, rgba(26,26,26,0.5) 100%);"
      />
    </div>

    <!-- Content zone -->
    <div class="absolute flex flex-col justify-between" style="top: 48px; bottom: 48px; left: 80px; right: 80px; padding: 32px 40px;">
      <!-- Top row: BLOG badge + date + tags -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Blog badge with document icon + sky color -->
          <span class="flex items-center gap-1" style="font-family: 'Monaspace Krypton', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #7dd3fc; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 12px;">
            <!-- Document text icon -->
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            blog
          </span>
          <!-- Calendar icon + date -->
          <div v-if="publishedAt" class="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style="font-family: 'Monaspace Krypton', monospace; font-size: 12px; letter-spacing: 0.06em; color: #999;">
              {{ publishedAt }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-for="tag in tags.slice(0, 3)"
            :key="tag"
            :style="{
              fontFamily: '\'Monaspace Krypton\', monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 10px',
              color: getTagColor(tag).color,
              border: `1px solid ${getTagColor(tag).border}`,
              background: getTagColor(tag).bg,
            }"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Center: title + description -->
      <div class="flex flex-col justify-center flex-1" style="padding: 16px 0;">
        <h1 style="font-family: 'Fenix', serif; font-size: 44px; font-weight: 700; line-height: 1.15; color: #d4825d; margin-bottom: 14px;">
          {{ title }}
        </h1>
        <p v-if="description" style="font-size: 18px; line-height: 1.5; color: #999999; max-width: 680px;">
          {{ description }}
        </p>
      </div>

      <!-- Bottom: URL with slug -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <!-- Globe icon -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span style="font-family: 'Monaspace Krypton', monospace; font-size: 13px; font-weight: 600; color: #b0b0b0;">
            kbrdn.dev
          </span>
          <span style="font-family: 'Monaspace Krypton', monospace; font-size: 13px; color: #999;">
            /blog{{ slug ? `/${slug}` : '' }}
          </span>
        </div>
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 13px; font-weight: 700;">
          <span style="color: #7dd3fc;">blog</span><span style="color: #e0e0e0;">@</span><span style="color: #d4825d;">kbrdn1</span>
        </span>
      </div>
    </div>
  </div>
</template>
