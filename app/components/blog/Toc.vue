<script setup lang="ts">
import { useI18n } from '#imports'
import type { ArticleReader } from '~/composables/useArticleReader'

const props = defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  progress?: number
  // An article's reader: its play button heads the table of contents, its steps are its
  // sections. None on the home page
  reader?: ArticleReader
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()

const { t } = useI18n()
const tocListRef = ref<HTMLElement | null>(null)
const reading = computed(() => (props.reader?.playing.value ? props.reader.sectionId.value : ''))
// Listening: the reader's slider stands for the progress, the scroll's ticks fold away
const listening = computed(() => !!props.reader?.started.value)

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
      <!-- Header: the reader's play, the title, the reading progress in ticks, the steps passed -->
      <div class="flex shrink-0 items-center gap-3 px-3 py-2.5">
        <BlogReaderPlay v-if="reader" :reader="reader" />
        <span class="text-[15px] text-neutral-900 dark:text-neutral-100">{{ t('blog.toc') }}</span>
        <div
          :class="
            cn(
              'ticks ml-auto h-3 bg-neutral-300 transition-[width,opacity] duration-300 ease-out-quint dark:bg-neutral-700',
              listening ? 'w-0 opacity-0' : 'w-16',
            )
          "
          :aria-hidden="listening || undefined"
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

      <BlogReaderBar v-if="reader" :reader="reader" class="px-3 pb-2.5" />

      <!-- Steps (scrollable) -->
      <div ref="tocListRef" class="panel-card min-h-0 overflow-y-auto p-1.5 scrollbar-none">
        <BlogTocSteps
          :items="items"
          :active-heading="activeHeading"
          :reading="reading"
          @scroll-to="emit('scroll-to', $event)"
        />
      </div>
    </div>
  </aside>
</template>
