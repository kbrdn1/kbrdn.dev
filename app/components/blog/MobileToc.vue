<script setup lang="ts">
// The table of contents under lg, in the sidebar's design: a floating panel whose bar
// carries the reader's step (its marker and title), the reading progress in ticks and the
// steps passed; the checklist unfolds above it, and closes once a section is picked.
import { useI18n } from '#imports'

const props = defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  activeHeadingText: string
  progress?: number
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()

const { t } = useI18n()
const open = ref(false)

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
        <div
          id="mobile-toc"
          class="panel-card mb-1 max-h-[55vh] overflow-y-auto p-1.5 scrollbar-none"
        >
          <BlogTocSteps
            :items="items"
            :active-heading="activeHeading"
            @scroll-to="handleScrollTo"
          />
        </div>
      </UiExpand>

      <button
        type="button"
        class="flex min-h-11 w-full items-center gap-2.5 py-1.5 pr-2.5 pl-2 text-left"
        :aria-expanded="open"
        aria-controls="mobile-toc"
        @click="open = !open"
      >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-mono text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-950"
          aria-hidden="true"
        >
          {{ current < 0 ? '·' : current + 1 }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="eyebrow block">{{ t('blog.toc') }}</span>
          <span class="block truncate text-[13px] text-neutral-900 dark:text-neutral-100">
            {{ activeHeadingText || steps[0]?.text }}
          </span>
        </span>
        <span
          class="ticks h-3 w-10 shrink-0 bg-neutral-300 dark:bg-neutral-700"
          role="progressbar"
          :aria-valuenow="progress ?? 0"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="t('blog.toc')"
        >
          <span
            class="block h-full bg-green-600 transition-[width] duration-300 dark:bg-green-500"
            :style="{ width: `${progress ?? 0}%` }"
          />
        </span>
        <span class="eyebrow shrink-0 tabular-nums">
          {{ Math.max(current, 0) }}/{{ steps.length }}
        </span>
        <UIcon
          name="i-heroicons-chevron-up-20-solid"
          :class="cn('size-4 shrink-0 text-(--label) transition-transform', open && 'rotate-180')"
          aria-hidden="true"
        />
      </button>
    </nav>
  </Teleport>
</template>
