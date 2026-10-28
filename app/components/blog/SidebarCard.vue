<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

withDefaults(
  defineProps<{
    title: string
    description: string
    image?: string
    badge?: string
    url: string
    dismissable?: boolean
  }>(),
  {
    image: '',
    badge: '',
    dismissable: true,
  },
)

const dismissed = ref(false)
const isHovered = ref(false)
// The actions open for the keyboard too: focus inside the card counts as a hover
const focused = ref(false)
function onFocusOut(event: FocusEvent) {
  focused.value = (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)
}

// The focus was on the button about to go: it moves back to what comes before the card
const root = ref<HTMLElement>()
function dismiss() {
  const card = root.value
  const before = card
    ? [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')]
        .filter((el) => card.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)
        .pop()
    : undefined
  dismissed.value = true
  before?.focus()
}
</script>

<template>
  <div v-if="!dismissed" ref="root" class="w-full">
    <div
      class="panel-card relative isolate overflow-hidden p-1.5 transition-colors hover:border-primary-500/40"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @focusin="focused = true"
      @focusout="onFocusOut"
    >
      <UiPixelCanvas />
      <!-- Image -->
      <div v-if="image" class="relative h-36 overflow-hidden rounded-[10px] bg-(--placeholder)">
        <UiPixelImage :src="image" class="size-full" reveal />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent"
        />

        <!-- Badge -->
        <span
          v-if="badge"
          class="tag pointer-events-none absolute top-2.5 right-2.5 text-primary-800 dark:text-primary-500"
        >
          {{ badge }}
        </span>

        <!-- Title overlay on image -->
        <div class="pointer-events-none absolute bottom-0 left-0 right-0 p-3">
          <p class="text-sm font-medium leading-snug text-white">
            {{ title }}
          </p>
        </div>
      </div>

      <!-- No image: title in body -->
      <div v-else class="p-3 pb-0">
        <div class="flex items-start justify-between gap-2">
          <p
            class="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug"
            style="font-family: 'Fenix', serif"
          >
            {{ title }}
          </p>
          <span v-if="badge" class="tag shrink-0 text-primary-800 dark:text-primary-500">
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
        :class="isHovered || focused ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
        style="
          transition:
            grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1),
            opacity 200ms ease !important;
        "
      >
        <div class="overflow-hidden">
          <div class="flex items-center justify-between px-3 pb-3 pt-0">
            <a
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[11px] font-mono font-bold text-primary-500 hover:text-primary-400 transition-colors"
            >
              {{ t('blog.sidebar.readMore') }}<span class="sr-only">: {{ title }}</span>
            </a>
            <button
              v-if="dismissable"
              type="button"
              class="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              @click.stop="dismiss"
            >
              {{ t('blog.sidebar.dismiss') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
