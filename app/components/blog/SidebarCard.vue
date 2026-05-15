<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  image?: string
  badge?: string
  url: string
  dismissable?: boolean
}>(), {
  image: '',
  badge: '',
  dismissable: true,
})

const dismissed = ref(false)
const isHovered = ref(false)

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <div
    v-if="!dismissed"
    class="w-full"
  >
    <div
      class="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-300 hover:border-primary-500/40"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Image -->
      <div v-if="image" class="relative h-36 overflow-hidden">
        <img
          :src="image"
          :alt="title"
          class="w-full h-full object-cover transition-transform duration-500"
          :class="isHovered ? 'scale-105' : 'scale-100'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />

        <!-- Badge -->
        <span
          v-if="badge"
          class="absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-primary-500 border border-primary-500/40 bg-primary-500/15"
        >
          {{ badge }}
        </span>

        <!-- Title overlay on image -->
        <div class="absolute bottom-0 left-0 right-0 p-3">
          <h4 class="text-sm font-bold text-white leading-snug" style="font-family: 'Fenix', serif;">
            {{ title }}
          </h4>
        </div>
      </div>

      <!-- No image: title in body -->
      <div v-else class="p-3 pb-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug" style="font-family: 'Fenix', serif;">
            {{ title }}
          </h4>
          <span
            v-if="badge"
            class="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-primary-500 border border-primary-500/40 bg-primary-500/15"
          >
            {{ badge }}
          </span>
        </div>
      </div>

      <!-- Description -->
      <div class="px-3 pt-2 pb-3">
        <p class="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
          {{ description }}
        </p>
      </div>

      <!-- Hover actions (grid height animation) -->
      <div
        class="grid overflow-hidden"
        :class="isHovered ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
        style="transition: grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease !important;"
      >
        <div class="overflow-hidden">
          <div class="flex items-center justify-between px-3 pb-3 pt-0">
            <a
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[11px] font-mono font-bold text-primary-500 hover:text-primary-400 transition-colors"
            >
              Read more
            </a>
            <button
              v-if="dismissable"
              type="button"
              class="text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              @click.stop="dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
