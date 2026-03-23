<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  description?: string
  handle?: string
  isHirable?: boolean
  statusText?: string
  avatarUrl?: string
  bannerText?: string
  bannerImage?: string
}>(), {
  title: 'Kylian Bardini',
  subtitle: 'Full Stack Developer',
  description: '',
  handle: '@kbrdn1',
  isHirable: true,
  statusText: 'Available for hire',
  avatarUrl: '',
  bannerText: '',
  bannerImage: '/images/banners/dark.jpg',
})
</script>

<template>
  <div class="h-full w-full flex relative overflow-hidden" style="background: #1a1a1a;">
    <!-- Diagonal stripes on left side zone -->
    <div
      class="absolute top-0 bottom-0 left-0"
      style="width: 80px; background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, #333 10px, #333 10.5px); opacity: 0.6;"
    />
    <!-- Diagonal stripes on right side zone -->
    <div
      class="absolute top-0 bottom-0 right-0"
      style="width: 80px; background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, #333 10px, #333 10.5px); opacity: 0.6;"
    />

    <!-- Vertical border lines -->
    <div class="absolute top-0 bottom-0" style="left: 80px; width: 1px; background: #2a2a2a;" />
    <div class="absolute top-0 bottom-0" style="right: 80px; width: 1px; background: #2a2a2a;" />

    <!-- Banner announcement bar at bottom (like HomeBanner) -->
    <div v-if="bannerText" class="absolute left-0 right-0 bottom-0 flex items-center justify-center" style="height: 40px; overflow: hidden;">
      <img
        :src="bannerImage"
        alt=""
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: top;"
      />
      <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent, rgba(26,26,26,0.5));" />
      <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(26,26,26,0.5), transparent, rgba(26,26,26,0.5));" />
      <div class="flex items-center gap-2" style="position: relative;">
        <!-- Rocket icon SVG -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.9);">
          {{ bannerText }}
        </span>
        <!-- Arrow right SVG -->
        <svg width="12" height="12" viewBox="0 0 20 20" fill="rgba(255,255,255,0.9)">
          <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Horizontal border lines -->
    <div class="absolute h-px" style="top: 60px; left: 80px; right: 80px; background: #2a2a2a;" />
    <div v-if="bannerText" class="absolute h-px" style="bottom: 40px; left: 80px; right: 80px; background: #2a2a2a;" />
    <div v-else class="absolute h-px" style="bottom: 60px; left: 80px; right: 80px; background: #2a2a2a;" />

    <!-- Content zone -->
    <div class="absolute flex flex-col justify-between" :style="{ top: '60px', bottom: bannerText ? '40px' : '60px', left: '80px', right: '80px', padding: '36px 48px' }">
      <!-- Top row: status badge + handle -->
      <div class="flex items-center justify-between">
        <div v-if="isHirable" class="flex items-center">
          <span
            class="flex items-center gap-2"
            style="padding: 6px 14px; font-family: 'Monaspace Krypton', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #e8a573; border: 1px solid rgba(232, 165, 115, 0.4); background: rgba(212, 130, 93, 0.15);"
          >
            <div class="w-2 h-2 rounded-full" style="background: #e8a573;" />
            {{ statusText }}
          </span>
        </div>
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 13px; font-weight: 700;">
          <span style="color: #e0e0e0;">@</span><span style="color: #d4825d;">kbrdn1</span>
        </span>
      </div>

      <!-- Center: name + subtitle + avatar -->
      <div class="flex items-center justify-between flex-1" style="padding: 16px 0;">
        <div class="flex flex-col justify-center flex-1">
          <h1 style="font-size: 54px; font-weight: 700; color: #e0e0e0; margin-bottom: 12px;">
            {{ title }}
          </h1>
          <p style="font-family: 'Fenix', serif; font-size: 34px; color: #d4825d;">
            {{ subtitle }}
          </p>
        </div>

        <!-- Avatar -->
        <div class="flex-shrink-0 flex items-center justify-center" style="width: 180px; height: 180px; border: 1px solid #3a3a3a; position: relative; overflow: hidden;">
          <div
            class="absolute inset-0"
            style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, #2a2a2a 10px, #2a2a2a 10.5px); opacity: 0.5;"
          />
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt=""
            style="width: 100%; height: 100%; object-fit: cover; position: relative;"
          />
          <span v-else style="font-size: 64px; font-weight: 700; color: #d4825d; position: relative;">KB</span>
        </div>
      </div>

      <!-- Bottom: branding -->
      <div class="flex items-center justify-between">
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 14px; font-weight: 600; color: #b0b0b0;">
          kbrdn.dev
        </span>
        <span style="font-family: 'Monaspace Krypton', monospace; font-size: 11px; color: #777;">
          portfolio
        </span>
      </div>
    </div>
  </div>
</template>
