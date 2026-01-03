<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface Props {
  calendarLink?: string
  email?: string
}

withDefaults(defineProps<Props>(), {
  calendarLink: 'https://cal.com',
  email: 'hello@kbrdn.dev'
})
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <span class="transition-transform duration-150 hover:scale-105 active:scale-95">
      <UButton
        :to="calendarLink"
        target="_blank"
        color="primary"
        variant="solid"
        size="sm"
        icon="i-heroicons-calendar-days"
      >
        {{ t('actions.bookCall') }}
      </UButton>
    </span>
    <span class="transition-transform duration-150 hover:scale-105 active:scale-95">
      <UButton
        :to="`mailto:${email}`"
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-heroicons-envelope"
      >
        {{ t('actions.sendEmail') }}
      </UButton>
    </span>
  </div>
</template>
