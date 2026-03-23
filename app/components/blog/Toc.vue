<script setup lang="ts">
defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  progress?: number
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()
</script>

<template>
  <aside
    v-if="items.length > 0"
    class="w-full shrink-0"
    aria-label="Table of contents"
  >
    <div class="border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 font-mono">
      <!-- Header with progress -->
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-[9px] uppercase tracking-widest text-neutral-400">sommaire</span>
        <span
          v-if="progress !== undefined"
          class="text-[10px] font-bold tabular-nums text-primary-500"
        >
          {{ progress }}%
        </span>
      </div>

      <!-- Progress bar -->
      <div class="mx-3 h-px bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
        <div
          class="absolute inset-y-0 left-0 bg-primary-500 transition-all duration-300"
          :style="{ width: `${progress || 0}%` }"
        />
      </div>

      <!-- Items -->
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
