<script setup lang="ts">
import type { TocItem } from '~/composables/useTocSteps'

// The checklist of an article's sections, shared by the sidebar's table of contents and the
// mobile one: the steps before the reader's ticked, the reader's own filled, the next ones
// open, each subsection under its step.
// reading: the heading of the section the article reader is reading, marked with the music
// player's equalizer
const props = defineProps<{ items: TocItem[]; activeHeading: string; reading?: string }>()

const emit = defineEmits<{ 'scroll-to': [id: string] }>()

// The music player's equalizer, on the step being read (still under reduced motion)
const EQ = [
  { name: 'eq1', height: '60%' },
  { name: 'eq2', height: '100%' },
  { name: 'eq3', height: '40%' },
]

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
              'flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-colors',
              item.id === reading
                ? 'bg-primary-500 text-neutral-950'
                : stepOf(item.id) < current
                  ? 'bg-primary-500/15 text-(--accent-text)'
                  : stepOf(item.id) === current
                    ? 'bg-primary-500 text-neutral-950'
                    : 'border border-(--control-border) text-(--label)',
            )
          "
          aria-hidden="true"
        >
          <span v-if="item.id === reading" class="flex h-2.5 items-end gap-px">
            <span
              v-for="bar in EQ"
              :key="bar.name"
              class="w-0.5 rounded-full bg-current"
              :style="{ height: bar.height, animation: `${bar.name} 0.8s ease-in-out infinite` }"
            />
          </span>
          <UIcon
            v-else-if="stepOf(item.id) < current"
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
                  ? 'text-neutral-500 dark:text-neutral-400'
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
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
          )
        "
        @click="emit('scroll-to', item.id)"
      >
        <span
          v-if="item.id === reading"
          class="-ml-1 flex h-2.5 w-2 shrink-0 items-end gap-px text-primary-500"
          aria-hidden="true"
        >
          <span
            v-for="bar in EQ"
            :key="bar.name"
            class="w-0.5 rounded-full bg-current"
            :style="{ height: bar.height, animation: `${bar.name} 0.8s ease-in-out infinite` }"
          />
        </span>
        <span v-else class="size-1 shrink-0 rounded-full bg-current" aria-hidden="true" />
        {{ item.text }}
      </button>
    </li>
  </ul>
</template>
