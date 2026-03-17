<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>

<template>
  <div class="mb-4">
    <span
      :class="
        cn(
          'text-[11px] font-mono uppercase tracking-[0.2em]',
          'text-neutral-500 dark:text-neutral-500',
        )
      "
    >
      {{ label }}
    </span>
  </div>
</template>
