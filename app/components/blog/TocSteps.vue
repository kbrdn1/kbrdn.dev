<script setup lang="ts">
import type { TocItem } from '~/composables/useTocSteps'

// The checklist of an article's sections, shared by the sidebar's table of contents and the
// mobile one: the steps before the reader's ticked, the reader's own filled, the next ones
// open, each subsection under its step.
const props = defineProps<{ items: TocItem[]; activeHeading: string }>()

const emit = defineEmits<{ 'scroll-to': [id: string] }>()

const { current, stepOf } = useTocSteps(
  () => props.items,
  () => props.activeHeading,
)
</script>

<template>
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
                ? 'bg-primary-500/15 text-(--accent-text)'
                : stepOf(item.id) === current
                  ? 'bg-primary-500 text-white dark:text-neutral-950'
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
</template>
