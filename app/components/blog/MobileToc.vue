<script setup lang="ts">
// The table of contents under lg, in the sidebar's design: a floating panel whose bar
// carries the reader's step (its marker and title), the reading progress in ticks and the
// steps passed; the checklist unfolds above it, and closes once a section is picked.
import { useI18n } from '#imports'
import type { ArticleReader } from '~/composables/useArticleReader'

const props = defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  activeHeadingText: string
  progress?: number
  // The article reader: its play button sits beside the bar, its steps are its sections
  reader: ArticleReader
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()

const { t } = useI18n()
const open = ref(false)
const { playing, started, sectionId, progress: listened } = props.reader
// The bar never grows (the music card and the page's scroll padding sit on its closed height):
// listening, its ticks show the listening progress, and the seekable slider opens in the panel,
// where the ticks fold away meanwhile. One bar at a time
const barProgress = computed(() => (started.value ? listened.value : (props.progress ?? 0)))

const { steps, current } = useTocSteps(
  () => props.items,
  () => props.activeHeading,
)

function handleScrollTo(id: string) {
  emit('scroll-to', id)
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <!-- Clear of the music button on the right -->
    <nav
      v-if="items.length > 0"
      class="panel fixed right-17 bottom-3 left-3 z-50 lg:hidden"
      :aria-label="t('blog.toc')"
    >
      <UiExpand :open="open">
        <BlogReaderBar :reader="reader" class="px-1.5 pt-1 pb-2.5" />
        <div
          id="mobile-toc"
          class="panel-card mb-1 max-h-[55vh] overflow-y-auto p-1.5 scrollbar-none"
        >
          <BlogTocSteps
            :items="items"
            :active-heading="activeHeading"
            :reading="playing ? sectionId : ''"
            @scroll-to="handleScrollTo"
          />
        </div>
      </UiExpand>

      <!-- The reader's play beside the bar, not inside it: the bar is a button -->
      <div class="flex items-center gap-2 pl-2">
        <BlogReaderPlay :reader="reader" />
        <button
          type="button"
          class="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 py-1.5 pr-2.5 text-left"
          :aria-expanded="open"
          aria-controls="mobile-toc"
          @click="open = !open"
        >
          <span
            class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-500 font-mono text-[10px] text-neutral-950"
            aria-hidden="true"
          >
            <template v-if="current < 0">·</template>
            <UiRollingNumber v-else :value="current + 1" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="eyebrow block">{{ t('blog.toc') }}</span>
            <!-- One line, cut by an ellipsis: UiRollingText wraps between words otherwise -->
            <span
              class="block truncate text-[13px] text-neutral-900 dark:text-neutral-100 [&_.rolling-text]:whitespace-nowrap!"
            >
              <UiRollingText :text="activeHeadingText || steps[0]?.text || ''" />
            </span>
          </span>
          <span
            :class="
              cn(
                'ticks h-3 shrink-0 bg-neutral-300 transition-[width,opacity] duration-300 ease-out-quint dark:bg-neutral-700',
                started && open ? 'w-0 opacity-0' : 'w-10',
              )
            "
            :aria-hidden="(started && open) || undefined"
            role="progressbar"
            :aria-valuenow="Math.round(barProgress)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="started ? t('listen.progress') : t('blog.readingProgress')"
          >
            <span
              class="block h-full bg-primary-500 transition-[width] duration-300"
              :style="{ width: `${barProgress}%` }"
            />
          </span>
          <span class="eyebrow shrink-0 tabular-nums">
            <UiRollingNumber :value="Math.max(current, 0)" />/{{ steps.length }}
          </span>
          <UIcon
            name="i-heroicons-chevron-up-20-solid"
            :class="cn('size-4 shrink-0 text-(--label) transition-transform', open && 'rotate-180')"
            aria-hidden="true"
          />
        </button>
      </div>
    </nav>
  </Teleport>
</template>
