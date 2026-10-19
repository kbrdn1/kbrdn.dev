<script setup lang="ts">
// One role or degree on /experience, laid out like an editorial spread (after
// isrod.eu/fr/experience): the story on the left, a rail on the right with the stack and
// the first missions; "Show more" unfolds the rest.
import { useI18n } from '#imports'

const props = withDefaults(
  defineProps<{
    id: string
    index: number
    title: string
    meta: string
    summary: string
    logo?: string
    stack: string[]
    itemsLabel: string
    items: string[]
    /** Missions shown before "Show more". */
    preview?: number
  }>(),
  { logo: undefined, preview: 2 },
)

const { t } = useI18n()
const open = ref(false)
const hasMore = computed(() => props.items.length > props.preview)
const shown = computed(() => (open.value ? props.items : props.items.slice(0, props.preview)))
</script>

<template>
  <article
    :id="id"
    class="grid scroll-mt-24 gap-8 border-t border-neutral-200 py-10 md:grid-cols-12 dark:border-neutral-800"
  >
    <header class="md:col-span-7">
      <span class="block font-mono text-[11px] tracking-widest text-neutral-500">
        {{ String(index).padStart(2, '0') }}
      </span>
      <div class="mt-2 flex items-center gap-3">
        <NuxtImg
          v-if="logo"
          :src="logo"
          alt=""
          width="36"
          height="36"
          class="size-9 shrink-0 object-contain"
        />
        <h3 class="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          <UiScrambleText :text="title" />
        </h3>
      </div>
      <p class="mt-3 font-mono text-xs uppercase tracking-wider text-primary-500">{{ meta }}</p>
      <p class="mt-5 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ summary }}
      </p>
      <button
        v-if="hasMore"
        type="button"
        :aria-expanded="open"
        :aria-controls="`${id}-items`"
        class="relative isolate mt-6 inline-flex items-center gap-2 overflow-hidden border border-neutral-300 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-neutral-700 transition-colors hover:border-primary-500/60 hover:text-primary-500 dark:border-neutral-700 dark:text-neutral-300"
        @click="open = !open"
      >
        <UiPixelCanvas />
        {{ open ? t('experiencePage.less') : t('experiencePage.more') }}
        <span aria-hidden="true">{{ open ? '−' : '+' }}</span>
      </button>
    </header>

    <aside
      class="space-y-6 border-neutral-200 md:col-span-5 md:border-l md:pl-8 dark:border-neutral-800"
    >
      <div>
        <h4 class="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          {{ t('experiencePage.stack') }}
        </h4>
        <p
          class="mt-2 font-mono text-xs uppercase leading-relaxed tracking-wider text-neutral-700 dark:text-neutral-300"
        >
          {{ stack.join(' · ') }}
        </p>
      </div>
      <div>
        <h4 class="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          {{ itemsLabel }}
        </h4>
        <ul
          :id="`${id}-items`"
          class="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
        >
          <li v-for="item in shown" :key="item" class="flex gap-2">
            <span class="mt-2 size-1.5 shrink-0 bg-primary-500" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </aside>
  </article>
</template>
