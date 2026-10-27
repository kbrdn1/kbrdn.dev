<script setup lang="ts">
// A page's hero scene (utils/pixelScenes), drawn in the theme's palette on no background: what
// never moves once, then what each tick draws. It plays only while on screen, and holds its
// frame while reduced motion is on, even if it is turned on later. Decorative.
import {
  PIXEL_SCENES,
  SCENE_FILL,
  SCENE_H,
  SCENE_TICK,
  SCENE_W,
  type PixelSceneName,
} from '~/utils/pixelScenes'

const props = defineProps<{ scene: PixelSceneName }>()
const scene = computed(() => PIXEL_SCENES[props.scene])

const tick = ref(0)
const cells = computed(() => scene.value.frame(tick.value % scene.value.ticks))

const reducedMotion = useReducedMotion()
const el = ref<SVGSVGElement>()
let timer: ReturnType<typeof setInterval> | undefined
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!el.value) return
  observer = new IntersectionObserver(([entry]) => {
    clearInterval(timer)
    timer = entry?.isIntersecting
      ? setInterval(() => reducedMotion.value || tick.value++, SCENE_TICK)
      : undefined
  })
  observer.observe(el.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearInterval(timer)
})
</script>

<template>
  <svg
    ref="el"
    :viewBox="`0 0 ${SCENE_W} ${SCENE_H}`"
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    <!-- What never moves, drawn again only for another scene -->
    <g v-memo="[props.scene]">
      <rect
        v-for="(cell, i) in scene.still"
        :key="i"
        :x="cell.x"
        :y="cell.y"
        :width="cell.w ?? 1"
        :height="cell.h ?? 1"
        :class="SCENE_FILL[cell.c]"
      />
    </g>
    <rect
      v-for="(cell, i) in cells"
      :key="`m${i}`"
      :x="cell.x"
      :y="cell.y"
      :width="cell.w ?? 1"
      :height="cell.h ?? 1"
      :class="SCENE_FILL[cell.c]"
    />
  </svg>
</template>
