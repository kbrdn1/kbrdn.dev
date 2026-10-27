<script setup lang="ts">
// One stop on /experience's vertical timeline (ExperienceTimeline draws the rail): the
// years on the left (the end over the start), a point on the rail, then the entry; on a
// phone, the entry alone. A role gets a large point and its logo, its
// projects a small one under it, a degree a diamond. Under the summary, the links (the
// company's, the clients', the school's site). The title is a disclosure (heading around a
// button, the accordion pattern): the stack and what was done unfold on their height. The
// illustration opens full size (UiLightbox). The entry being read in the strip lights its
// point.
import { useI18n } from '#imports'

const props = defineProps<{
  id: string
  kind: 'role' | 'project' | 'degree'
  start: string
  end: string | null
  title: string
  /** Under the title: who, what */
  detail: string
  meta: string
  summary: string
  logo?: string
  /** An illustration, beside the summary */
  image?: string
  stack: string[]
  itemsLabel: string
  items: string[]
  links?: { label: string; to: string; external?: boolean }[]
  active?: boolean
}>()

const { t } = useI18n()
const open = ref(false)
const lightbox = useLightbox()

const from = computed(() => props.start.slice(0, 4))
const to = computed(() => props.end?.slice(0, 4) ?? '')
</script>

<template>
  <!-- scroll-mt-40: an anchor lands under the navbar, its notch and the compact strip -->
  <li :id="id" class="scroll-mt-40 md:grid md:grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] md:gap-x-4">
    <!-- The years, the end first: the timeline reads from now backwards -->
    <p
      :class="
        cn(
          'eyebrow hidden pt-1 text-right tabular-nums transition-colors md:block',
          kind === 'project' && 'pt-0.5',
          active && 'text-(--accent-text)',
        )
      "
    >
      <span class="block">{{ to || from }}</span>
      <span v-if="to && to !== from" class="block opacity-60">{{ from }}</span>
    </p>

    <!-- The rail and its point -->
    <div class="relative hidden justify-center md:flex" aria-hidden="true">
      <span
        :class="
          cn(
            'relative mt-2 shrink-0 transition-[box-shadow,background-color,border-color] duration-300',
            kind === 'role' && 'size-3 rounded-full bg-primary-500',
            kind === 'project' &&
              'mt-1.5 size-2 rounded-full border border-primary-500 bg-(--card-bg)',
            kind === 'degree' && 'size-2.5 rotate-45 border border-(--label) bg-(--card-bg)',
            active &&
              'shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-primary-500)_22%,transparent)]',
            active && kind !== 'role' && 'border-primary-500 bg-primary-500',
          )
        "
      />
    </div>

    <div :class="cn('min-w-0', kind === 'project' ? 'pb-6' : 'pb-9')">
      <component :is="kind === 'project' ? 'h4' : 'h3'">
        <button
          type="button"
          class="group flex w-full items-start gap-3 text-left"
          :aria-expanded="open"
          :aria-controls="`${id}-details`"
          @click="open = !open"
        >
          <NuxtImg
            v-if="logo"
            :src="logo"
            alt=""
            width="40"
            height="40"
            class="size-10 shrink-0 rounded-xl object-cover ring-1 ring-(--card-border)"
          />
          <span class="min-w-0 flex-1">
            <span
              :class="
                cn(
                  'block tracking-tight text-neutral-900 transition-colors group-hover:text-(--accent-text) dark:text-neutral-100',
                  kind === 'project' ? 'text-lg' : 'text-2xl',
                )
              "
            >
              <UiScrambleText :text="title" />
            </span>
            <span class="eyebrow mt-1 block">{{ detail }}</span>
          </span>
          <span
            class="icon-btn mt-0.5 size-8 shrink-0 border border-(--control-border)"
            aria-hidden="true"
          >
            <UIcon
              name="i-heroicons-plus-20-solid"
              :class="cn('size-4 transition-transform duration-300', open && 'rotate-45')"
            />
          </span>
        </button>
      </component>

      <div
        :class="cn(image && 'md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-start md:gap-6')"
      >
        <div>
          <p class="eyebrow mt-3 text-(--accent-text)">{{ meta }}</p>
          <p
            :class="
              cn(
                'mt-2 max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400',
                kind === 'project' ? 'text-sm' : 'text-[15px]',
              )
            "
          >
            {{ summary }}
          </p>
          <p v-if="links?.length" class="eyebrow mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <template v-for="(link, i) in links" :key="link.to">
              <span v-if="i" aria-hidden="true">/</span>
              <NuxtLink
                :to="link.to"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="underline underline-offset-4 hover:text-(--accent-text)"
              >
                {{ link.label }} {{ link.external ? '↗' : '→' }}
              </NuxtLink>
            </template>
          </p>
        </div>
        <!-- Through the pixel layer, crisp on hover; client only like every pixel picture.
             A click opens it full size. -->
        <button
          v-if="image"
          type="button"
          class="group/zoom relative mt-4 block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-200 ring-1 ring-(--card-border) md:mt-3 dark:bg-neutral-900"
          :aria-label="t('lightbox.open', { name: title })"
          @click="lightbox.open(image, title)"
        >
          <ClientOnly>
            <UiPixelImage :src="image" alt="" class="size-full" reveal />
          </ClientOnly>
          <span
            class="icon-btn absolute top-2 right-2 size-7 bg-(--card-bg) opacity-0 transition-opacity group-hover/zoom:opacity-100 group-focus-visible/zoom:opacity-100"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-maximize-2" class="size-3.5" />
          </span>
        </button>
      </div>

      <UiExpand :open="open">
        <div :id="`${id}-details`" class="max-w-2xl space-y-5 pt-5">
          <ul class="flex flex-wrap gap-1.5" :aria-label="t('experiencePage.stack')">
            <li
              v-for="tool in stack"
              :key="tool"
              class="inline-flex h-6 items-center rounded-full border border-(--control-border) px-2.5 text-xs text-neutral-700 dark:text-neutral-300"
            >
              {{ tool }}
            </li>
          </ul>
          <div>
            <p class="eyebrow">{{ itemsLabel }}</p>
            <ul
              class="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              <li v-for="item in items" :key="item" class="flex gap-2">
                <span
                  class="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                  aria-hidden="true"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </UiExpand>
    </div>
  </li>
</template>
