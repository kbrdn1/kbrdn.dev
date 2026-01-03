<script setup lang="ts">
/**
 * Animated Section Component
 *
 * A wrapper that animates its children when they enter the viewport.
 * Uses Intersection Observer for scroll-triggered animations.
 *
 * @example
 * <UiAnimatedSection>
 *   <MyComponent />
 * </UiAnimatedSection>
 *
 * <UiAnimatedSection animation="slideUp" :delay="200">
 *   <MyComponent />
 * </UiAnimatedSection>
 */

interface Props {
  /** Animation type */
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
  /** Delay in milliseconds before animation starts */
  delay?: number
  /** Duration in milliseconds */
  duration?: number
  /** Threshold for Intersection Observer (0-1) */
  threshold?: number
  /** Only animate once (true) or every time it enters viewport (false) */
  once?: boolean
  /** Tag to render as */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  animation: 'fadeInUp',
  delay: 0,
  duration: 500,
  threshold: 0.1,
  once: true,
  as: 'div'
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const hasAnimated = ref(false)

// Detect reduced motion preference
const prefersReducedMotion = useReducedMotion()

// Effective animation (simplified for reduced motion)
const effectiveAnimation = computed(() => {
  if (prefersReducedMotion.value) return 'fadeIn'
  return props.animation
})

// Effective duration (instant for reduced motion)
const effectiveDuration = computed(() => {
  if (prefersReducedMotion.value) return 0
  return props.duration
})

// Animation classes
const animationStyles = computed(() => {
  // If reduced motion, show immediately
  if (prefersReducedMotion.value) {
    return { opacity: 1, transform: 'none' }
  }

  const baseStyle = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${effectiveDuration.value}ms`,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: `${props.delay}ms`,
    willChange: isVisible.value ? 'auto' : 'opacity, transform'
  }

  if (!isVisible.value) {
    // Initial state (before animation)
    switch (effectiveAnimation.value) {
      case 'fadeIn':
        return { ...baseStyle, opacity: 0 }
      case 'fadeInUp':
        return { ...baseStyle, opacity: 0, transform: 'translateY(20px)' }
      case 'fadeInDown':
        return { ...baseStyle, opacity: 0, transform: 'translateY(-20px)' }
      case 'fadeInLeft':
        return { ...baseStyle, opacity: 0, transform: 'translateX(-20px)' }
      case 'fadeInRight':
        return { ...baseStyle, opacity: 0, transform: 'translateX(20px)' }
      case 'scaleIn':
        return { ...baseStyle, opacity: 0, transform: 'scale(0.95)' }
      default:
        return { ...baseStyle, opacity: 0 }
    }
  }

  // Animated state - remove will-change after animation
  return { ...baseStyle, opacity: 1, transform: 'none', willChange: 'auto' }
})

onMounted(() => {
  if (!sectionRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (props.once && hasAnimated.value) return
          isVisible.value = true
          hasAnimated.value = true
        } else if (!props.once) {
          isVisible.value = false
        }
      })
    },
    { threshold: props.threshold }
  )

  observer.observe(sectionRef.value)

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <component
    :is="as"
    ref="sectionRef"
    :style="animationStyles"
  >
    <slot />
  </component>
</template>
