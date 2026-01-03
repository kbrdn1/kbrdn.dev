<script setup lang="ts">
/**
 * CodeGroup MDC Component
 * Usage in markdown:
 * ::code-group
 * ```js [JavaScript]
 * console.log('Hello')
 * ```
 * ```ts [TypeScript]
 * console.log('Hello')
 * ```
 * ::
 */

import { ref, computed, useSlots } from 'vue'

const slots = useSlots()
const activeTab = ref(0)

// Extract tab labels from slot children
const tabs = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot) return []

  return defaultSlot
    .filter((vnode) => vnode.type !== Comment)
    .map((vnode, index) => {
      // Try to get filename from props or use index
      const filename = vnode.props?.filename || vnode.props?.label || `Tab ${index + 1}`
      return {
        label: filename,
        index,
      }
    })
})
</script>

<template>
  <div class="code-group my-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
    <!-- Tab headers -->
    <div class="flex border-b border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        v-for="tab in tabs"
        :key="tab.index"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="[
          activeTab === tab.index
            ? 'border-b-2 border-primary-500 bg-white text-primary-600 dark:bg-neutral-950 dark:text-primary-400'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        ]"
        @click="activeTab = tab.index"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div class="relative">
      <template v-for="(tab, index) in tabs" :key="tab.index">
        <div v-show="activeTab === index" class="code-group-content">
          <slot :name="`tab-${index}`">
            <!-- Render the corresponding slot content -->
            <component
              :is="slots.default?.()[index]"
              v-if="slots.default?.()[index]"
            />
          </slot>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.code-group-content :deep(pre) {
  margin: 0;
  border-radius: 0;
  border: none;
}
</style>
