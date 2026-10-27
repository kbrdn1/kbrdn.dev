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

// Read as a checklist, after disarto's "Getting started": every top-level section is a
// step, the ones before the reader's ticked, the reader's own filled, the next ones open.
const steps = computed(() => props.items.filter((item) => item.level < 3))
const current = computed(() => {
  const at = props.items.findIndex((item) => item.id === props.activeHeading)
  if (at < 0) return -1
  // A subsection belongs to the step above it
  for (let i = at; i >= 0; i--) {
    if (props.items[i]!.level < 3) return steps.value.indexOf(props.items[i]!)
  }
  return -1
})
const stepOf = (id: string) => steps.value.findIndex((step) => step.id === id)

watch(
  () => props.activeHeading,
  (id) => {
    if (!id || !tocListRef.value) return
    const activeBtn = tocListRef.value.querySelector(`[data-toc-id="${id}"]`) as HTMLElement
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
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
          :aria-label="t('blog.toc')"
        >
          <div
            class="h-full bg-green-600 transition-[width] duration-300 dark:bg-green-500"
            :style="{ width: `${progress ?? 0}%` }"
          />
        </div>
        <span class="eyebrow shrink-0 tabular-nums">
          {{ Math.max(current, 0) }}/{{ steps.length }}
        </span>
      </div>

      <!-- Steps (scrollable) -->
      <div ref="tocListRef" class="panel-card min-h-0 overflow-y-auto p-1.5 scrollbar-none">
        <ul>
          <li v-for="item in items" :key="item.id">
            <!-- A step: its marker, then its title -->
            <button
              v-if="item.level < 3"
              type="button"
              :data-toc-id="item.id"
              class="row flex w-full items-center gap-2.5 px-2 py-1.5 text-left"
              :aria-current="stepOf(item.id) === current ? 'step' : undefined"
              @click="emit('scroll-to', item.id)"
            >
              <span
                :class="
                  cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]',
                    stepOf(item.id) < current
                      ? 'bg-green-600 text-white dark:bg-green-500 dark:text-neutral-950'
                      : stepOf(item.id) === current
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                        : 'border border-(--control-border) text-(--label)',
                  )
                "
                aria-hidden="true"
              >
                <UIcon
                  v-if="stepOf(item.id) < current"
                  name="i-heroicons-check-16-solid"
                  class="size-3"
                />
                <template v-else>{{ stepOf(item.id) + 1 }}</template>
              </span>
              <span
                :class="
                  cn(
                    'min-w-0 text-[13px] leading-snug',
                    stepOf(item.id) === current
                      ? 'text-neutral-900 dark:text-neutral-100'
                      : stepOf(item.id) < current
                        ? 'text-neutral-500'
                        : 'text-neutral-600 dark:text-neutral-400',
                  )
                "
              >
                {{ item.text }}
              </span>
            </button>
            <!-- A subsection, under its step -->
            <button
              v-else
              type="button"
              :data-toc-id="item.id"
              :class="
                cn(
                  'row flex w-full items-center gap-2 py-1 pr-2 pl-9 text-left text-xs leading-snug',
                  activeHeading === item.id
                    ? 'text-(--accent-text)'
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                )
              "
              @click="emit('scroll-to', item.id)"
            >
              <span class="size-1 shrink-0 rounded-full bg-current" aria-hidden="true" />
              {{ item.text }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
