<script setup lang="ts">
// The home page's table of contents: the same box as an article's (BlogToc), set in the
// margin outside the 80rem column, so only where that margin can hold it (>= 1700px
// leaves 210px). The section the reader is in follows the scroll, like the header's
// tabs used to before they became page links.
import { useI18n } from '#imports'

const { t } = useI18n()
const reducedMotion = useReducedMotion()

const items = computed(() => [
  { id: 'about', text: t('sections.about'), level: 2 },
  { id: 'latest-posts', text: t('sections.blog'), level: 2 },
  { id: 'skills', text: t('sections.skills'), level: 2 },
  { id: 'projects', text: t('sections.projects'), level: 2 },
  { id: 'activity', text: t('sections.activity'), level: 3 },
  { id: 'experience', text: t('sections.parcours'), level: 2 },
])

const active = ref('')
const progress = ref(0)
const HEADER_OFFSET = 84 // floating header (ends at 70px) and some air

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
    behavior: reducedMotion.value ? 'auto' : 'smooth',
  })
}

let cleanup: (() => void) | undefined

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) active.value = entry.target.id
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  for (const { id } of items.value) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  let frame = 0
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.value = max > 0 ? Math.round((window.scrollY / max) * 100) : 0
    })
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  cleanup = () => {
    observer.disconnect()
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div
    class="pointer-events-auto fixed top-24 z-20 hidden w-44 min-[1700px]:block"
    style="left: calc(50% + 40rem + 1.25rem)"
  >
    <BlogToc
      :items="items"
      :active-heading="active"
      :progress="progress"
      @scroll-to="scrollToSection"
    />
  </div>
</template>
