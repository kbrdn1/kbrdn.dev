<script setup lang="ts">
// The kbrdn.dev mascot, a monkey in a backwards cap: one 384px webp per mood in
// public/images/mascot/. Decorative, always next to text that already says what happened.
withDefaults(
  defineProps<{
    mood:
      | 'angry'
      | 'awkward'
      | 'clap'
      | 'coffee'
      | 'content'
      | 'cyborg'
      | 'dizzy'
      | 'excited'
      | 'flag-code'
      | 'flex'
      | 'full-body'
      | 'grin'
      | 'hoodie'
      | 'hoodie-cool'
      | 'hoodie-happy'
      | 'hopeful'
      | 'kiss'
      | 'laugh'
      | 'linux'
      | 'love'
      | 'money'
      | 'nervous'
      | 'neutral'
      | 'party'
      | 'sad'
      | 'shocked'
      | 'side-eye'
      | 'smug'
      | 'starstruck'
      | 'stonks'
      | 'thinking'
    size?: number
  }>(),
  { size: 64 },
)
</script>

<template>
  <img
    :src="`/images/mascot/${mood}.webp`"
    :width="size"
    :height="size"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    draggable="false"
    class="shrink-0 select-none"
  />
</template>
