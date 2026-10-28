<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()

// One button cycles light → dark → blur; it shows the mode it switches to.
const NEXT = { light: 'dark', dark: 'blur', blur: 'light' } as const
const MODES = {
  light: {
    icon: 'i-heroicons-sun-20-solid',
    color: 'text-yellow-500',
    label: 'themeSwitch.toLight',
  },
  dark: {
    icon: 'i-heroicons-moon-20-solid',
    color: 'text-primary-500',
    label: 'themeSwitch.toDark',
  },
  blur: { icon: 'i-lucide-blend', color: 'text-cyan-500', label: 'themeSwitch.toBlur' },
}

const next = computed(() => NEXT[colorMode.value as keyof typeof NEXT] ?? 'dark')
const target = computed(() => MODES[next.value])

// The new mode spreads from the button in a circle, a halo in its colour along the edge
// (transitions.css). Through a view transition: the old page is a still snapshot under the
// circle, so nothing fades colour by colour. Without view transitions or under reduced
// motion, the mode just switches.
const DURATION = 900
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

async function toggleTheme(event: MouseEvent) {
  const mode = next.value
  if (!document.startViewTransition || isMotionReduced()) {
    colorMode.preference = mode
    return
  }

  const button = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = button.left + button.width / 2
  const y = button.top + button.height / 2
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const root = document.documentElement

  // Part of the new page only, so the circle reveals it along with the rest
  const halo = document.createElement('div')
  halo.className = 'theme-halo'
  halo.dataset.mode = mode
  halo.style.setProperty('--halo-x', `${x}px`)
  halo.style.setProperty('--halo-y', `${y}px`)

  root.dataset.themeSwitch = ''
  const transition = document.startViewTransition(async () => {
    colorMode.preference = mode
    document.body.append(halo)
    await nextTick()
  })

  try {
    await transition.ready
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: DURATION, easing: EASING, pseudoElement: '::view-transition-new(root)' },
    )
    // The ring follows the circle's edge on the same curve; it fades on the clock, late
    halo.animate(
      { '--halo-r': ['0px', `${radius}px`] },
      { duration: DURATION, easing: EASING, fill: 'forwards' },
    )
    halo.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], {
      duration: DURATION,
      fill: 'forwards',
    })
    await transition.finished
  } catch {
    // ready rejects when the transition is skipped (another one took over): the mode has
    // switched all the same
  } finally {
    halo.remove()
    delete root.dataset.themeSwitch
  }
}
</script>

<template>
  <ClientOnly>
    <UTooltip :text="t(target.label)">
      <button
        type="button"
        class="icon-btn cursor-pointer"
        :aria-label="t(target.label)"
        @click="toggleTheme"
      >
        <UIcon :name="target.icon" :class="cn('w-4 h-4', target.color)" />
      </button>
    </UTooltip>
    <template #fallback>
      <div class="size-9">
        <div class="w-4 h-4" />
      </div>
    </template>
  </ClientOnly>
</template>
