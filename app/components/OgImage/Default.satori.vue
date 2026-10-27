<script setup lang="ts">
// The pages' OG image: one of the site's panels (UiPanel) on the dither field, as a profile
// card. Its header carries the logo, the handle and the availability badge; its card the
// name, the title in Fenix, the line of context or, on the home, the career in figures, and
// the drawn portrait; its footer the address and a button to the site.
// Satori: every style on one line (its gradient parser fails on split values), every box
// with several children a flex box.
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  description?: string
  handle?: string
  isHirable?: boolean
  statusText?: string
  figures?: { label: string, value: number | string }[]
  stack?: string[]
  avatar?: string
}>(), {
  title: 'Kylian Bardini',
  subtitle: 'Full Stack Developer',
  description: '',
  handle: '@kbrdn1',
  isHirable: true,
  statusText: 'Open to opportunities',
  figures: () => [],
  stack: () => ['TypeScript', 'Vue', 'Nuxt', 'Laravel', 'AWS', 'Rust'],
  avatar: '/images/og/avatar.png',
})
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #0a0a0a;">
    <!-- The site's dither field, frozen (scripts/og-dither.ts) -->
    <img src="/images/og/dither.png" alt="" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px;" />

    <!-- The panel -->
    <div class="absolute flex flex-col" style="top: 44px; bottom: 44px; left: 130px; right: 130px; padding: 6px; background: #0f0f0f; border: 1px solid #262626; border-radius: 26px; box-shadow: 0 24px 48px -24px rgba(0,0,0,0.7);">
      <!-- Header: logo and handle, the badge -->
      <div class="flex items-center justify-between" style="height: 50px; padding: 0 8px 0 14px;">
        <div class="flex items-center" style="gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 96 96">
            <path d="M64 0H96L0 96V64Z" fill="#e5e5e5" />
            <path d="M0 0L24 24L0 48ZM56 56L96 96H64L40 72Z" fill="#d4825d" />
          </svg>
          <span style="font-family: 'Monaspace Krypton', monospace; font-size: 16px; font-weight: 700;">
            <span style="color: #e5e5e5;">@</span><span style="color: #d4825d;">{{ handle.replace(/^@/, '') }}</span>
          </span>
        </div>
        <span v-if="isHirable" class="flex items-center" style="gap: 8px; padding: 6px 12px; font-family: 'Monaspace Krypton', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #22c55e; border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.06); border-radius: 999px;">
          <span style="width: 7px; height: 7px; border-radius: 999px; background: #22c55e;" />
          {{ statusText }}
        </span>
      </div>

      <!-- The card -->
      <div class="flex flex-1" style="padding: 30px 34px; gap: 32px; background: #191919; border: 1px solid #262626; border-radius: 18px;">
        <div class="flex flex-col flex-1 justify-between">
          <div class="flex flex-col">
            <h1 style="margin: 0 0 6px; font-size: 56px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; color: #ececec;">
              {{ title }}
            </h1>
            <p style="margin: 0; font-family: 'Fenix', serif; font-size: 32px; color: #d4825d;">
              {{ subtitle }}
            </p>
            <p v-if="description" style="margin: 16px 0 0; font-size: 17px; line-height: 1.5; color: #a3a3a3;">
              {{ description }}
            </p>
            <!-- The stack, in the site's pills -->
            <div class="flex flex-wrap" style="margin-top: 22px; gap: 8px;">
              <span v-for="tool in stack" :key="tool" style="padding: 5px 12px; font-family: 'Monaspace Krypton', monospace; font-size: 12px; color: #b5b5b5; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px;">
                {{ tool }}
              </span>
            </div>
          </div>
          <!-- The figures between dashed rules -->
          <div v-if="figures.length" class="flex flex-col">
            <div style="height: 1px; background-image: repeating-linear-gradient(90deg, #333333 0px, #333333 5px, transparent 5px, transparent 9px);" />
            <div class="flex" style="padding-top: 14px;">
              <div v-for="figure in figures" :key="figure.label" class="flex flex-col" style="flex: 1;">
                <span style="font-family: 'Monaspace Krypton', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8a8a;">
                  {{ figure.label }}
                </span>
                <span style="margin-top: 2px; font-size: 32px; letter-spacing: -0.02em; color: #ececec;">
                  {{ figure.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- The drawn portrait, a bust standing on the card's edge, on a glow of the accent -->
        <div class="flex items-end justify-center" style="width: 250px; overflow: hidden; border: 1px solid #2a2a2a; border-radius: 14px; background: radial-gradient(circle at 50% 70%, rgba(212,130,93,0.3) 0%, rgba(212,130,93,0.06) 55%, #141414 80%);">
          <img :src="avatar" alt="" width="270" height="270" style="width: 270px; height: 270px;" />
        </div>
      </div>

      <!-- Footer: the address, the button -->
      <div class="flex items-center justify-between" style="height: 52px; padding: 0 6px 0 14px;">
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8a8a8a;">github.com/kbrdn1</span>
        <span class="flex items-center" style="gap: 8px; padding: 8px 16px; font-size: 15px; color: #ffffff; background: #d4825d; border-radius: 999px;">
          kbrdn.dev
          <svg width="14" height="14" viewBox="0 0 20 20" fill="#ffffff">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
