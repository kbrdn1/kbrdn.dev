<script setup lang="ts">
// Dotted grid background pattern component
// Uses CSS pattern from main.css for performance

// alt: a second colour for the dither, in patches through the orange (the blog's blue)
defineProps<{ alt?: string }>()

// In blur mode the dither fills the screen, unfaded: it is what the glass blurs. The canvas
// reads its props once, so it remounts when the fade changes.
const colorMode = useColorMode()
const fade = computed(() => (colorMode.value === 'blur' ? 'none' : 'down'))

// Now and then, a glow runs along one of the column's borders, down or up, at random. Never
// under reduced motion; held while the page is hidden.
const reducedMotion = useReducedMotion()
const glow = ref<{ id: number; side: 'left' | 'right'; up: boolean }>()
let timer: ReturnType<typeof setTimeout> | undefined
let ids = 0
function plan() {
  clearTimeout(timer)
  timer = setTimeout(
    () => {
      if (!reducedMotion.value && !document.hidden)
        glow.value = {
          id: ++ids,
          side: Math.random() < 0.5 ? 'left' : 'right',
          up: Math.random() < 0.5,
        }
      plan()
    },
    7000 + Math.random() * 9000,
  )
}
onMounted(plan)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    class="fixed inset-0 -z-10 dotted-background bg-[#f0eeeb] dark:bg-[#121212]"
    aria-hidden="true"
  />
  <!-- Backdrop and dither are not inside the -z-10 layer: the minimal layout's opaque
       root would cover them. At z-0 they paint above every layout root and under main
       (z-10). The backdrop is the space outside the 80rem column: a grid, and a border
       along the column continuing the header's, both fading out downwards. The +1px
       puts each border on the header's own. -->
  <div
    class="pointer-events-none fixed inset-0 z-0 hidden xl:block [mask-image:linear-gradient(#000,transparent_min(95vh,900px))]"
    aria-hidden="true"
  >
    <div
      class="absolute inset-y-0 left-0 w-[calc(50%-40rem+1px)] grid-background-blog border-r border-neutral-200 dark:border-neutral-800"
    />
    <div
      class="absolute inset-y-0 right-0 w-[calc(50%-40rem+1px)] grid-background-blog border-l border-neutral-200 dark:border-neutral-800"
    />
    <span
      v-if="glow"
      :key="glow.id"
      :class="['border-glow', glow.up && 'border-glow-up']"
      :style="{ left: glow.side === 'left' ? 'calc(50% - 40rem)' : 'calc(50% + 40rem - 1px)' }"
      @animationend="glow = undefined"
    />
  </div>
  <UiDitherCanvas
    :key="fade"
    interactive
    :fade="fade"
    :alt="alt"
    class="fixed inset-x-0 top-0 z-0 h-[85vh] w-full [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] blur:h-screen blur:[mask-image:none]"
  />
</template>

<style scoped>
/* A light the height of a few lines on the border, running its length; the backdrop's mask
   fades it out downwards like the border itself */
.border-glow {
  position: absolute;
  top: 0;
  width: 1px;
  height: 10rem;
  background: linear-gradient(transparent, var(--color-primary-500), transparent);
  box-shadow: 0 0 8px 2px color-mix(in srgb, var(--color-primary-500) 60%, transparent);
  animation: border-glow 2.4s cubic-bezier(0.45, 0, 0.55, 1) both;
}

.border-glow-up {
  animation-direction: reverse;
}

@keyframes border-glow {
  from {
    translate: 0 -10rem;
  }
  to {
    translate: 0 min(95vh, 900px);
  }
}
</style>
