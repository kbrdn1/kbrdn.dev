<script setup lang="ts">
// The pages' OG image, the repos' banners' card (disarto's "Deployment" sheets): the dither
// field, two dashed construction lines along the panel's sides, nothing else outside it. The
// panel: a header (the handle, the window's icons), the card (the name and the title in Fenix,
// the buttons; the drawn portrait, or the page's pixel scene, and the facts; the career in
// figures on the home, the stack elsewhere), a footer (icons, the address in mono, a button).
// Satori: every style on one line (its gradient parser fails on split values), every box
// with several children a flex box.
import {
  PIXEL_SCENES,
  SCENE_H,
  SCENE_OG_TICK,
  SCENE_W,
  sceneColor,
  type PixelSceneName,
} from '~/utils/pixelScenes'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  description?: string
  handle?: string
  isHirable?: boolean
  statusText?: string
  location?: string
  labels?: { status: string, location: string, site: string, github: string }
  figures?: { label: string, value: number | string }[]
  stack?: string[]
  avatar?: string
  /** The page's pixel scene (utils/pixelScenes) in place of the portrait */
  scene?: PixelSceneName
}>(), {
  title: 'Kylian Bardini',
  subtitle: 'Full Stack Developer',
  description: '',
  handle: '@kbrdn1',
  isHirable: true,
  statusText: 'Open to opportunities',
  location: 'Nancy, France',
  labels: () => ({ status: 'Status', location: 'Location', site: 'Site', github: 'GitHub' }),
  figures: () => [],
  stack: () => ['TypeScript', 'Vue', 'Nuxt', 'Laravel', 'AWS', 'Rust'],
  avatar: '/images/og/avatar.png',
  scene: undefined,
})

// The scene at its best moment, in the dark theme's colours (no CSS in satori)
const sceneCells = computed(() => {
  if (!props.scene) return []
  // An unknown name (the OG URL is open to anyone) draws the portrait instead; own keys
  // only, or `constructor` and the like pass for a scene
  if (!Object.hasOwn(PIXEL_SCENES, props.scene)) return []
  const scene = PIXEL_SCENES[props.scene]
  return [...scene.still, ...scene.frame(SCENE_OG_TICK[props.scene])].flatMap((cell) => {
    const color = sceneColor(cell.c)
    return color ? [{ ...cell, fill: color[0], opacity: color[1] }] : []
  })
})

const handle = computed(() => props.handle.replace(/^@/, ''))
const facts = computed<{ icon: keyof typeof OG_ICONS, label: string, kind: 'ok' | 'person' | 'text', value: string }[]>(() => [
  ...(props.isHirable ? [{ icon: 'status' as const, label: props.labels.status, kind: 'ok' as const, value: props.statusText }] : []),
  { icon: 'pin', label: props.labels.location, kind: 'text', value: props.location },
  { icon: 'link', label: props.labels.site, kind: 'text', value: 'kbrdn.dev' },
  { icon: 'user', label: props.labels.github, kind: 'person', value: handle.value },
])
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #0c0c0e;">
    <!-- The site's dither field, frozen (scripts/og-dither.ts) -->
    <img src="/images/og/dither.png" alt="" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px;" />
    <!-- The construction lines, along the panel's sides -->
    <div style="position: absolute; top: 0; bottom: 0; left: 150px; width: 1px; background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 6px, transparent 6px, transparent 11px);" />
    <div style="position: absolute; top: 0; bottom: 0; left: 1049px; width: 1px; background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 6px, transparent 6px, transparent 11px);" />

    <!-- The panel, centred: its height follows its content -->
    <div class="absolute flex items-center justify-center" style="top: 0; left: 0; width: 1200px; height: 630px;">
      <div class="flex flex-col" style="box-sizing: border-box; width: 900px; padding: 0 6px 6px; background: #141417; border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.85);">
        <!-- Header: the handle, the window's icons -->
        <div class="flex items-center justify-between" style="box-sizing: border-box; height: 52px; padding: 0 12px 0 16px;">
          <span style="font-size: 19px; font-weight: 500; letter-spacing: -0.01em; color: #ececf0;">@{{ handle }}</span>
          <div class="flex" style="gap: 16px;">
            <svg v-for="name in ['expand', 'close'] as const" :key="name" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS[name]" />
          </div>
        </div>

        <!-- The card -->
        <div class="flex flex-col" style="padding: 24px 28px; background: #1b1b1f; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px;">
          <div class="flex justify-between" style="gap: 24px;">
            <div class="flex flex-col">
              <h1 style="margin: 0; font-size: 48px; font-weight: 500; letter-spacing: -0.03em; line-height: 1; color: #ececf0;">{{ title }}</h1>
              <p style="margin: 10px 0 0; font-family: 'Fenix', serif; font-size: 24px; line-height: 1.2; color: #d4825d;">{{ subtitle }}</p>
              <p v-if="description" style="margin: 10px 0 0; max-width: 520px; font-size: 15px; line-height: 1.45; color: #9a9aa3;">{{ description }}</p>
            </div>
            <div class="flex" style="gap: 8px; padding-top: 4px;">
              <span class="flex items-center" style="box-sizing: border-box; gap: 7px; height: 36px; padding: 0 15px; font-size: 14px; font-weight: 500; color: #ececf0; background: #1b1b1f; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ececf0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.globe" />
                kbrdn.dev
              </span>
              <span class="flex items-center" style="box-sizing: border-box; gap: 7px; height: 36px; padding: 0 15px; font-size: 14px; font-weight: 500; color: #111114; background: #d4825d; border: 1px solid #d4825d; border-radius: 999px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111114" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.visit" />
                Contact
              </span>
            </div>
          </div>

          <!-- The drawn portrait, or the page's scene, and the facts -->
          <div class="flex items-center" style="margin-top: 20px; gap: 28px;">
            <div v-if="sceneCells.length" class="flex items-center justify-center" style="box-sizing: border-box; width: 290px; height: 168px; overflow: hidden; background: #0f0f12; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;">
              <svg width="208" height="156" :viewBox="`0 0 ${SCENE_W} ${SCENE_H}`" shape-rendering="crispEdges">
                <rect v-for="(cell, i) in sceneCells" :key="i" :x="cell.x" :y="cell.y" :width="cell.w ?? 1" :height="cell.h ?? 1" :fill="cell.fill" :fill-opacity="cell.opacity" />
              </svg>
            </div>
            <div v-else class="flex items-end justify-center" style="box-sizing: border-box; width: 290px; height: 168px; overflow: hidden; background: #0f0f12; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;">
              <img :src="avatar" alt="" width="196" height="196" style="width: 196px; height: 196px; margin-bottom: -24px;" />
            </div>
            <div class="flex flex-col" style="gap: 9px;">
              <div v-for="fact in facts" :key="fact.icon" class="flex items-center" style="min-height: 30px;">
                <span class="flex items-center" style="width: 138px; gap: 10px; font-size: 15px; color: #9a9aa3;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS[fact.icon]" />
                  {{ fact.label }}
                </span>
                <span v-if="fact.kind === 'ok'" class="flex items-center" style="box-sizing: border-box; gap: 7px; height: 28px; padding: 0 12px; font-size: 13px; font-weight: 500; color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); border-radius: 999px;">
                  <span style="width: 6px; height: 6px; border-radius: 999px; background: #4ade80;" />
                  {{ fact.value }}
                </span>
                <span v-else-if="fact.kind === 'person'" class="flex items-center" style="box-sizing: border-box; gap: 6px; height: 28px; padding: 0 11px 0 3px; font-size: 14px; color: #ececf0; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px;">
                  <img src="/images/og/person.png" alt="" width="22" height="22" style="width: 22px; height: 22px; border-radius: 999px;" />
                  {{ fact.value }}
                </span>
                <span v-else style="font-size: 15px; color: #ececf0;">{{ fact.value }}</span>
              </div>
            </div>
          </div>

          <!-- After a dashed rule: the career in figures (home), else the stack -->
          <template v-if="!description">
            <div style="height: 1px; margin: 20px 0 16px; background-image: repeating-linear-gradient(90deg, #303036 0px, #303036 6px, transparent 6px, transparent 11px);" />
            <div v-if="figures.length" class="flex">
              <div v-for="figure in figures" :key="figure.label" class="flex flex-col" style="flex: 1;">
                <span style="font-family: 'Monaspace Krypton', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9a9aa3;">{{ figure.label }}</span>
                <span style="margin-top: 4px; font-size: 28px; line-height: 1; letter-spacing: -0.02em; color: #ececf0;">{{ figure.value }}</span>
              </div>
            </div>
            <div v-else class="flex flex-wrap" style="gap: 8px;">
              <span v-for="tool in stack" :key="tool" style="box-sizing: border-box; display: flex; align-items: center; height: 30px; padding: 0 13px; font-size: 13px; color: #d4d4d8; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px;">{{ tool }}</span>
            </div>
          </template>
        </div>

        <!-- Footer: icons, the address, a button -->
        <div class="flex items-center justify-between" style="box-sizing: border-box; height: 52px; padding: 0 4px 0 16px;">
          <div class="flex items-center" style="gap: 16px;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS.more" />
            <span style="width: 1px; height: 20px; background: #303036;" />
            <svg v-for="name in ['sparkles', 'terminal'] as const" :key="name" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9a9aa3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="OG_ICONS[name]" />
          </div>
          <div class="flex items-center" style="gap: 16px;">
            <span style="font-family: 'Monaspace Krypton', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #9a9aa3;">github.com/{{ handle }}</span>
            <span style="box-sizing: border-box; display: flex; align-items: center; height: 36px; padding: 0 16px; font-size: 14px; font-weight: 500; color: #ececf0; background: #1b1b1f; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;">Portfolio</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
