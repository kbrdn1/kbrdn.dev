<script lang="ts">
// Panels below the fold come in from the left and the right in turn
let count = 0
</script>

<script setup lang="ts">
// A rounded panel holding .panel-card surfaces, after disarto's widgets: a header (title,
// a grey subtitle, actions on the right), the cards, then an optional footer (mono meta on
// the left, buttons on the right). Below the fold, it comes in as it is scrolled to, swung
// in slightly from one side, the next panel from the other.
defineProps<{ title?: string; subtitle?: string }>()

const root = ref<HTMLElement>()
const hidden = useReveal(root)
const side = count++ % 2 ? 'right' : 'left'
</script>

<template>
  <div ref="root" class="panel" :data-hidden="hidden ? side : undefined">
    <div
      v-if="title || $slots.actions"
      class="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 pr-2 pl-4"
    >
      <h2 v-if="title" class="text-[17px] text-neutral-900 dark:text-neutral-100">
        <UiScrambleText :text="title" />
        <span v-if="subtitle" class="ml-1.5 text-(--label)">{{ subtitle }}</span>
      </h2>
      <div v-if="$slots.actions" class="flex items-center gap-1.5">
        <slot name="actions" />
      </div>
    </div>
    <slot />
    <div
      v-if="$slots.footer || $slots.meta"
      class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 pr-2 pl-4"
    >
      <p class="eyebrow">
        <slot name="meta" />
      </p>
      <div class="flex items-center gap-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
