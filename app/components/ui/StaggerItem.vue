<script setup lang="ts">
/**
 * Stagger Item Component
 *
 * A child item that animates with stagger when inside StaggerContainer.
 * Can also be used standalone with explicit index prop.
 *
 * @example
 * <UiStaggerContainer>
 *   <UiStaggerItem v-for="(item, i) in items" :key="i" :index="i">
 *     {{ item }}
 *   </UiStaggerItem>
 * </UiStaggerContainer>
 */

interface Props {
  /** Index for calculating stagger delay */
  index?: number
  /** Override animation type */
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
  /** Tag to render as */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  as: 'div'
})

// Try to inject context from StaggerContainer
const staggerContext = inject<ComputedRef<{
  isVisible: Ref<boolean>
  staggerDelay: number
  baseDelay: number
  animation: string
  duration: number
  prefersReducedMotion: boolean
}> | null>('staggerContext', null)

// Fallback reduced motion detection for standalone usage
const standaloneReducedMotion = useReducedMotion()

const isVisible = computed(() => staggerContext?.value?.isVisible?.value ?? true)
const prefersReducedMotion = computed(() => staggerContext?.value?.prefersReducedMotion ?? standaloneReducedMotion.value)
const staggerDelay = computed(() => staggerContext?.value?.staggerDelay ?? 100)
const baseDelay = computed(() => staggerContext?.value?.baseDelay ?? 0)
const animation = computed(() => props.animation ?? staggerContext?.value?.animation ?? 'fadeInUp')
const duration = computed(() => staggerContext?.value?.duration ?? 400)

const delay = computed(() => baseDelay.value + (props.index * staggerDelay.value))

const animationStyles = computed(() => {
  // If reduced motion, show immediately without transitions
  if (prefersReducedMotion.value) {
    return { opacity: 1, transform: 'none' }
  }

  const baseStyle = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration.value}ms`,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: `${delay.value}ms`,
    willChange: isVisible.value ? 'auto' : 'opacity, transform'
  }

  if (!isVisible.value) {
    switch (animation.value) {
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

  return { ...baseStyle, opacity: 1, transform: 'none', willChange: 'auto' }
})
</script>

<template>
  <component :is="as" :style="animationStyles">
    <slot />
  </component>
</template>
