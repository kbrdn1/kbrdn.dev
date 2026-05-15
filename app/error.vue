<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();
// useError() doit être appelé même si non utilisé directement pour que Nuxt expose l'error context au template
const _error = useError();

// 404 pixel font map — each digit is a 5x7 grid (1 = filled, 0 = empty)
const DIGITS: Record<string, number[][]> = {
  "4": [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  "0": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

const PIXEL_SIZE = 12;
const PIXEL_GAP = 3;
const DIGIT_SPACING = 16;
const STEP = PIXEL_SIZE + PIXEL_GAP;

interface Pixel {
  id: number;
  x: number;
  y: number;
  originX: number;
  originY: number;
}

// Build the "404" pixel layout
function buildPixels(): Pixel[] {
  const digits = ["4", "0", "4"];
  const pixels: Pixel[] = [];
  let id = 0;

  let cursorX = 0;
  for (const digit of digits) {
    const grid = DIGITS[digit]!;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row]!.length; col++) {
        if (grid[row]![col]) {
          const x = cursorX + col * STEP;
          const y = row * STEP;
          pixels.push({ id: id++, x, y, originX: x, originY: y });
        }
      }
    }
    cursorX += DIGITS[digit]![0]!.length * STEP + DIGIT_SPACING;
  }

  return pixels;
}

const pixels = ref<Pixel[]>(buildPixels());

// Canvas dimensions
const canvasWidth = computed(() => {
  const digits = ["4", "0", "4"];
  let w = 0;
  for (const d of digits) w += DIGITS[d]![0]!.length * STEP + DIGIT_SPACING;
  return w - DIGIT_SPACING;
});
const canvasHeight = 7 * STEP - PIXEL_GAP;

// Dragging state
const dragging = ref<{ id: number; offsetX: number; offsetY: number } | null>(null);

function onMouseDown(event: MouseEvent, pixel: Pixel) {
  event.preventDefault();
  dragging.value = {
    id: pixel.id,
    offsetX: event.clientX - pixel.x,
    offsetY: event.clientY - pixel.y,
  };
}

function onMouseMove(event: MouseEvent) {
  if (!dragging.value) return;
  const px = pixels.value.find((p) => p.id === dragging.value!.id);
  if (px) {
    px.x = event.clientX - dragging.value.offsetX;
    px.y = event.clientY - dragging.value.offsetY;
  }
}

function onMouseUp() {
  dragging.value = null;
}

function resetPixels() {
  pixels.value = buildPixels();
}

function handleBackHome() {
  clearError({ redirect: "/" });
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
    style="background-color: #1a1a1a;"
  >
    <!-- Diagonal stripe sides -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(212, 130, 93, 0.04) 10px, rgba(212, 130, 93, 0.04) 10.5px);"
      aria-hidden="true"
    />

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center gap-8 px-6">
      <!-- Pixel canvas -->
      <div
        class="relative"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        aria-label="404"
      >
        <div
          v-for="pixel in pixels"
          :key="pixel.id"
          class="absolute cursor-grab active:cursor-grabbing transition-shadow"
          :style="{
            width: PIXEL_SIZE + 'px',
            height: PIXEL_SIZE + 'px',
            left: pixel.x + 'px',
            top: pixel.y + 'px',
            backgroundColor: '#d4825d',
            boxShadow: dragging?.id === pixel.id ? '0 0 8px rgba(212, 130, 93, 0.6)' : '0 0 2px rgba(212, 130, 93, 0.3)',
          }"
          @mousedown="onMouseDown($event, pixel)"
        />
      </div>

      <!-- Text content -->
      <div class="text-center flex flex-col items-center gap-6 mt-4">
        <p
          class="text-neutral-400 text-base"
          style="font-family: 'Monaspace Krypton', monospace;"
        >
          {{ t('error.subtitle') }}
        </p>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            :class="cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm',
              'border border-neutral-700 text-neutral-400',
              'hover:border-neutral-500 hover:text-neutral-200',
              'transition-colors duration-200',
              'font-mono',
            )"
            @click="resetPixels"
          >
            <span aria-hidden="true">↺</span>
            {{ t('error.reset') }}
          </button>

          <NuxtLink
            :class="cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm',
              'bg-primary-500 text-white',
              'hover:bg-primary-600',
              'transition-colors duration-200',
              'font-mono',
            )"
            to="/"
            @click.prevent="handleBackHome"
          >
            <span aria-hidden="true">←</span>
            {{ t('error.backHome') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
