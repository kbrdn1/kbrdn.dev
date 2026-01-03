<script setup lang="ts">
import { useI18n } from '#imports'

const { t, locale } = useI18n()

interface Experience {
  id: string
  key: string
  company: string
  logo: string
  startDate: string
  endDate: string | null
  current: boolean
  technologies: string[]
  tasksCount: number
}

const experiences: Experience[] = [
  {
    id: 'flippad',
    key: 'flippad',
    company: 'Flippad x Jewely',
    logo: '/images/logos/flippad.jpg',
    startDate: '2023-10',
    endDate: null,
    current: true,
    technologies: ['Laravel', 'Vue', 'Nuxt', 'AWS', 'React', 'Symfony', 'Redis', 'Stripe', 'Hono.js', 'Prisma'],
    tasksCount: 5,
  },
  {
    id: 'virtual-immersion',
    key: 'virtualImmersion',
    company: 'Virtual Immersion',
    logo: '/images/logos/virtual-immersion.jpeg',
    startDate: '2022-11',
    endDate: '2023-09',
    current: false,
    technologies: ['Symfony', 'Laravel', 'React', 'WordPress', 'MySQL', 'Tailwind CSS'],
    tasksCount: 4,
  }
]

const expandedId = ref<string | null>(experiences[0].id)
const logoError = ref<Record<string, boolean>>({})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function getExperienceContent(exp: Experience) {
  const tasks = Array.from({ length: exp.tasksCount }, (_, i) =>
    t(`experiences.${exp.key}.tasks.${i}`)
  )
  return {
    role: t(`experiences.${exp.key}.role`),
    type: t(`experiences.${exp.key}.type`),
    tasks
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">{{ t('experiences.title') }}</h2>

    <!-- Horizontal Accordions with Stagger Animation -->
    <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-2">
      <UiStaggerItem
        v-for="(exp, index) in experiences"
        :key="exp.id"
        :index="index"
        class="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-hidden"
      >
        <!-- Accordion Header -->
        <button
          :class="cn(
            'group/header w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
            expandedId === exp.id
              ? 'bg-primary-500/5 border-b border-neutral-200 dark:border-neutral-800'
              : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:border-l-2 hover:border-l-primary-500/50 hover:pl-[14px]'
          )"
          @click="toggleExpand(exp.id)"
        >
          <!-- Logo -->
          <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <NuxtImg
              v-if="!logoError[exp.id]"
              :src="exp.logo"
              :alt="exp.company"
              width="32"
              height="32"
              class="w-8 h-8 object-contain"
              @error="logoError[exp.id] = true"
            />
            <span
              v-else
              class="w-8 h-8 flex items-center justify-center text-xs font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              {{ getInitials(exp.company) }}
            </span>
          </div>

          <!-- Company & Role -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ exp.company }}</span>
              <span
                v-if="exp.current"
                class="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 text-primary-500"
              >
                {{ t('experiences.current') }}
              </span>
            </div>
            <p class="text-xs text-neutral-500 truncate">
              {{ getExperienceContent(exp).role }}
            </p>
          </div>

          <!-- Date & Chevron -->
          <div class="flex items-center gap-2 text-xs text-neutral-500">
            <span class="hidden sm:inline">
              {{ formatDate(exp.startDate) }} - {{ exp.current ? t('experiences.present') : formatDate(exp.endDate!) }}
            </span>
            <UIcon
              :name="expandedId === exp.id ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
              class="w-4 h-4 text-neutral-400 group-hover/header:text-primary-500 transition-colors"
            />
          </div>
        </button>

        <!-- Accordion Content -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedId === exp.id" class="overflow-hidden">
            <div class="p-4 space-y-3">
              <!-- Type & Date (mobile) -->
              <p class="text-xs text-neutral-500 sm:hidden">
                {{ getExperienceContent(exp).type }} · {{ formatDate(exp.startDate) }} - {{ exp.current ? t('experiences.present') : formatDate(exp.endDate!) }}
              </p>

              <!-- Technologies -->
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tech in exp.technologies"
                  :key="tech"
                  :class="cn(
                    'px-1.5 py-0.5 text-[10px] font-mono',
                    'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-500 border border-neutral-300 dark:border-neutral-700',
                    'hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/30',
                    'transition-colors duration-150 cursor-default'
                  )"
                >
                  {{ tech }}
                </span>
              </div>

              <!-- Tasks -->
              <ul class="space-y-1.5 text-sm">
                <li
                  v-for="(task, index) in getExperienceContent(exp).tasks"
                  :key="index"
                  class="flex gap-2 text-neutral-600 dark:text-neutral-400"
                >
                  <span class="text-primary-500 flex-shrink-0">›</span>
                  <span class="leading-snug">{{ task }}</span>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
