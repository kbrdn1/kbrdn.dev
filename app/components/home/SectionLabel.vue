<script setup lang="ts">
interface Props {
  label: string;
  tag?: 'h2' | 'h3' | 'span';
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'h2',
});
</script>

<template>
  <div class="mb-4">
    <component
      :is="props.tag"
      :class="
        cn(
          'text-[11px] font-mono uppercase tracking-[0.2em]',
          'text-neutral-500 dark:text-neutral-500',
        )
      "
    >
      {{ label }}
    </component>
  </div>
</template>
