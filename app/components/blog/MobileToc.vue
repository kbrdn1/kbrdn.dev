<script setup lang="ts">
defineProps<{
  items: { id: string; text: string; level: number }[]
  activeHeading: string
  activeHeadingText: string
}>()

const emit = defineEmits<{
  'scroll-to': [id: string]
}>()

const mobileTocOpen = ref(false)

function handleScrollTo(id: string) {
  emit('scroll-to', id)
  mobileTocOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="items.length > 0"
      class="lg:hidden fixed bottom-0 left-0 right-0 z-50"
    >
      <!-- Expanded TOC list -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="mobileTocOpen"
          class="border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md px-4 py-3 max-h-64 overflow-y-auto"
        >
          <ul class="space-y-px font-mono">
            <li
              v-for="item in items"
              :key="item.id"
            >
              <button
                type="button"
                :class="[
                  'flex items-center w-full text-left text-xs leading-snug py-1.5 px-2 rounded transition-all',
                  item.level >= 3 ? 'ml-4' : '',
                  activeHeading === item.id
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200',
                ]"
                @click="handleScrollTo(item.id)"
              >
                <span v-if="activeHeading === item.id" class="shrink-0 text-primary-500 mr-1.5 select-none">▸</span>
                <span v-else class="shrink-0 mr-1.5 w-2 select-none" />
                <span v-if="item.level >= 3" class="shrink-0 text-neutral-300 dark:text-neutral-600 mr-1">└</span>
                {{ item.text }}
              </button>
            </li>
          </ul>
        </div>
      </Transition>

      <!-- Always visible bar -->
      <button
        type="button"
        class="w-full flex items-center gap-3 px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md"
        @click="mobileTocOpen = !mobileTocOpen"
      >
        <span class="text-[9px] font-mono uppercase tracking-widest text-neutral-400 shrink-0">Sommaire</span>
        <span class="flex-1 text-xs font-mono text-primary-500 truncate text-left">
          {{ activeHeadingText }}
        </span>
        <UIcon
          name="i-heroicons-chevron-up"
          :class="['w-4 h-4 text-neutral-400 transition-transform', mobileTocOpen ? 'rotate-180' : '']"
        />
      </button>
    </div>
  </Teleport>
</template>
