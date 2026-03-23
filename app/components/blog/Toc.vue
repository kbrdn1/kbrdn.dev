<script setup lang="ts">
defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()
</script>

<template>
  <aside
    v-if="items.length > 0"
    class="hidden lg:block w-64 shrink-0"
    aria-label="Table of contents"
  >
    <div class="sticky top-20 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 font-mono">
      <div class="px-3 py-2">
        <span class="text-[9px] uppercase tracking-widest text-neutral-400">sommaire</span>
      </div>
      <div class="mx-3 border-b border-neutral-200 dark:border-neutral-800" />
      <div class="p-3">
        <ul class="space-y-px">
          <li
            v-for="item in items"
            :key="item.id"
          >
            <button
              type="button"
              :class="cn(
                'flex items-center w-full text-left text-[11px] leading-snug py-1 px-1.5 -mx-1.5 transition-all',
                activeHeading === item.id
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
              )"
              @click="emit('scroll-to', item.id)"
            >
              <span v-if="activeHeading === item.id" class="shrink-0 text-primary-500 mr-1 select-none">▸</span>
              <span v-else class="shrink-0 mr-1 w-2 select-none" />
              <span v-if="item.level >= 3" class="shrink-0 text-neutral-300 dark:text-neutral-600 mr-1">└</span>
              <span :class="item.level >= 3 ? 'text-[10px]' : ''">{{ item.text }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
