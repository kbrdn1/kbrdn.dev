<script setup lang="ts">
import { useI18n } from '#imports'

const props = defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  progress?: number
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()

const { t } = useI18n()
const tocListRef = ref<HTMLElement | null>(null)

// Read as a checklist (TocSteps): the header counts the steps passed
const { steps, current } = useTocSteps(
  () => props.items,
  () => props.activeHeading,
)

watch(
  () => props.activeHeading,
  (id) => {
    if (!id || !tocListRef.value) return
    const activeBtn = tocListRef.value.querySelector(`[data-toc-id="${id}"]`) as HTMLElement
    if (activeBtn) {
      activeBtn.scrollIntoView({
        block: 'nearest',
        behavior: isMotionReduced() ? 'auto' : 'smooth',
      })
    }
  },
)
</script>

<template>
  <aside v-if="items.length > 0" class="flex min-h-0 w-full flex-col" :aria-label="t('blog.toc')">
    <div class="panel flex min-h-0 flex-col">
      <!-- Header: the title, the reading progress in ticks, the steps passed -->
      <div class="flex shrink-0 items-center gap-3 px-3 py-2.5">
        <span class="text-[15px] text-neutral-900 dark:text-neutral-100">{{ t('blog.toc') }}</span>
        <div
          class="ticks ml-auto h-3 w-16 bg-neutral-300 dark:bg-neutral-700"
          role="progressbar"
          :aria-valuenow="progress ?? 0"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="t('blog.readingProgress')"
        >
          <div
            class="h-full bg-primary-500 transition-[width] duration-300"
            :style="{ width: `${progress ?? 0}%` }"
          />
        </div>
        <span class="eyebrow shrink-0 tabular-nums">
          <UiRollingNumber :value="Math.max(current, 0)" />/{{ steps.length }}
        </span>
      </div>

      <!-- Steps (scrollable) -->
      <div ref="tocListRef" class="panel-card min-h-0 overflow-y-auto p-1.5 scrollbar-none">
        <BlogTocSteps
          :items="items"
          :active-heading="activeHeading"
          @scroll-to="emit('scroll-to', $event)"
        />
      </div>
    </div>
  </aside>
</template>
