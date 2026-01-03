<script setup lang="ts">
/**
 * Stagger Container Component
 *
 * Wraps multiple children and animates them with staggered delays.
 * Each child fades in sequentially based on staggerDelay.
 *
 * @example
 * <UiStaggerContainer :stagger-delay="100">
 *   <div>First (0ms)</div>
 *   <div>Second (100ms)</div>
 *   <div>Third (200ms)</div>
 * </UiStaggerContainer>
 */

interface Props {
  /** Delay between each child animation in ms */
  staggerDelay?: number
  /** Base delay before first animation in ms */
  baseDelay?: number
  /** Animation type for children */
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
  /** Duration of each animation in ms */
  duration?: number
  /** Tag to render as */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  staggerDelay: 100,
  baseDelay: 0,
  animation: 'fadeInUp',
  duration: 400,
  as: 'div'
})

const containerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// Detect reduced motion preference
const prefersReducedMotion = useReducedMotion()

// Effective values based on reduced motion preference
const effectiveStaggerDelay = computed(() => prefersReducedMotion.value ? 0 : props.staggerDelay)
const effectiveBaseDelay = computed(() => prefersReducedMotion.value ? 0 : props.baseDelay)
const effectiveAnimation = computed(() => prefersReducedMotion.value ? 'fadeIn' : props.animation)
const effectiveDuration = computed(() => prefersReducedMotion.value ? 0 : props.duration)

onMounted(() => {
  if (!containerRef.value) return

  // If reduced motion, show immediately
  if (prefersReducedMotion.value) {
    isVisible.value = true
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.disconnect()
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(containerRef.value)

  onUnmounted(() => {
    observer.disconnect()
  })
})

// Provide animation context to children
provide('staggerContext', computed(() => ({
  isVisible,
  staggerDelay: effectiveStaggerDelay.value,
  baseDelay: effectiveBaseDelay.value,
  animation: effectiveAnimation.value,
  duration: effectiveDuration.value,
  prefersReducedMotion: prefersReducedMotion.value
})))
</script>

<template>
  <component :is="as" ref="containerRef">
    <slot :is-visible="isVisible" />
  </component>
</template>
