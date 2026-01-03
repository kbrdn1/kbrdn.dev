<script setup lang="ts">
interface Props {
  paragraphs: string[]
}

defineProps<Props>()
</script>

<template>
  <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
    <UiStaggerItem
      v-for="(paragraph, index) in paragraphs"
      :key="index"
      :index="index"
      as="p"
    >
      {{ paragraph }}
    </UiStaggerItem>
  </UiStaggerContainer>
</template>
