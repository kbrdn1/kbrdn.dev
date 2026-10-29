<script setup lang="ts">
// Codrops' line text hover effects, without GSAP (useScrambleText):
// - `title` (V4): retypes when it first scrolls into view (a page title: on load) and on
//   hover, while a block rises behind it;
// - `link` (V1): a square cursor runs along as it retypes, on hover or keyboard focus of
//   the enclosing link or button.
// Each glyph is drawn over its own invisible character, so nothing re-wraps or shifts.
// Screen readers get an sr-only copy of the text; the server sends it settled.
import type { ScrambleChar, ScrambleEffect } from '~/composables/useScrambleText'

const props = withDefaults(defineProps<{ text: string; effect?: ScrambleEffect }>(), {
  effect: 'title',
})
const { chars, play } = useScrambleText(() => props.text, props.effect)
const root = ref<HTMLElement>()

// A line may break between words, never inside one.
const words = computed(() =>
  chars.value.reduce<ScrambleChar[][]>(
    (out, c) => {
      if (c.char === ' ') out.push([])
      else out.at(-1)!.push(c)
      return out
    },
    [[]],
  ),
)

let appeared = false
let cleanup: (() => void) | undefined

onMounted(() => {
  const el = root.value
  if (!el) return
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') play()
  }
  if (props.effect === 'link') {
    const target = el.closest<HTMLElement>('a, button') ?? el.parentElement ?? el
    target.addEventListener('pointerenter', onEnter)
    target.addEventListener('focusin', play)
    cleanup = () => {
      target.removeEventListener('pointerenter', onEnter)
      target.removeEventListener('focusin', play)
    }
    return
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    appeared = true
    play()
    observer.disconnect()
  })
  observer.observe(el)
  el.addEventListener('pointerenter', onEnter)
  cleanup = () => {
    observer.disconnect()
    el.removeEventListener('pointerenter', onEnter)
  }
})

// A locale switch retypes a title already on screen.
watch(
  () => props.text,
  () => appeared && nextTick(play),
)

onUnmounted(() => cleanup?.())
</script>

<template>
  <span ref="root" :class="cn('scramble', effect === 'title' && 'scramble-title')">
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true">
      <template v-for="(word, w) in words" :key="w">
        <span class="inline-block whitespace-nowrap"
          ><span
            v-for="(c, i) in word"
            :key="i"
            class="scramble-char"
            :class="{ 'is-hidden': c.hidden, 'is-cursor': c.cursor }"
            :data-glyph="c.glyph ?? undefined"
            >{{ c.char }}</span
          ></span
        >{{ w < words.length - 1 ? ' ' : '' }}
      </template>
    </span>
  </span>
</template>

<style scoped>
.scramble {
  font-kerning: none;
}

.scramble-char {
  position: relative;
  display: inline-block;
}

/* The character keeps its width; its fill goes, the glyph is drawn over it. */
.scramble-char[data-glyph],
.scramble-char.is-hidden {
  -webkit-text-fill-color: transparent;
}

.scramble-char[data-glyph]::after {
  content: attr(data-glyph);
  position: absolute;
  inset: 0;
  text-align: center;
  -webkit-text-fill-color: currentColor;
}

/* V1's block cursor, over the glyph */
.scramble-char.is-cursor::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: currentColor;
}

/* V4's block, rising from the bottom on hover: a flat tint, no blur over the live canvas. */
.scramble-title {
  position: relative;
  isolation: isolate;
  display: inline-block;
}

.scramble-title::before {
  content: '';
  position: absolute;
  inset: -0.08em -0.2em;
  z-index: -1;
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  transform: scaleY(0);
  transform-origin: 50% 100%;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.scramble-title:hover::before {
  transform: scaleY(1);
  transition-duration: 1s;
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}

@media (prefers-reduced-motion: reduce) {
  .scramble-title::before {
    transition: none;
  }
}
</style>
