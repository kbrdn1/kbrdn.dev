<script setup lang="ts">
// A rounded panel holding .panel-card surfaces, under an optional header: a mono label
// on the left, actions (pills) on the right.
defineProps<{ label?: string }>()
</script>

<template>
  <div class="panel">
    <div
      v-if="label || $slots.actions"
      class="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 py-2"
    >
      <h2 v-if="label" class="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500">
        <UiScrambleText :text="label" />
      </h2>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </div>
</template>
