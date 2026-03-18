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
    company: 'Jewely x Flippad',
    logo: '/images/logos/jewely-x-flippad.png',
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
    logo: '/images/logos/virtual-immersion.png',
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
  <div>
    <!-- Accordions with Stagger Animation -->
    <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-4">
      <UiStaggerItem
        v-for="(exp, index) in experiences"
        :key="exp.id"
        :index="index"
        class="border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
      >
        <!-- Accordion Header -->
        <button
          type="button"
          :aria-expanded="expandedId === exp.id"
          :aria-controls="'exp-panel-' + exp.id"
          :class="cn(
            'group/header w-full flex items-center gap-4 p-5 text-left transition-all duration-300',
            expandedId === exp.id
              ? 'bg-primary-500/5 border-b border-primary-500/20'
              : ''
          )"
          @click="toggleExpand(exp.id)"
        >
          <!-- Logo -->
          <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <NuxtImg
              v-if="!logoError[exp.id]"
              :src="exp.logo"
              :alt="exp.company"
              width="40"
              height="40"
              class="w-10 h-10 object-contain"
              @error="logoError[exp.id] = true"
            />
            <span
              v-else
              class="w-10 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              {{ getInitials(exp.company) }}
            </span>
          </div>

          <!-- Company & Role -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5">
              <span class="text-lg font-medium text-neutral-900 dark:text-neutral-100">{{ exp.company }}</span>
              <span
                v-if="exp.current"
                class="px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border border-primary-500/30 text-primary-500"
              >
                {{ t('experiences.current') }}
              </span>
            </div>
            <p class="text-sm text-neutral-400 truncate">
              {{ getExperienceContent(exp).role }}
            </p>
          </div>

          <!-- Date & Chevron -->
          <div class="flex items-center gap-3">
            <span class="hidden sm:inline font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ formatDate(exp.startDate) }} - {{ exp.current ? t('experiences.present') : formatDate(exp.endDate!) }}
            </span>
            <div class="relative w-5 h-5 text-neutral-400 group-hover/header:text-primary-500" aria-hidden="true">
              <span class="absolute inset-0 flex items-center justify-center">
                <span class="block w-3 h-0.5 bg-current" />
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center accordion-icon-bar"
                :class="expandedId === exp.id ? 'is-expanded' : 'is-collapsed'"
              >
                <span class="block w-3 h-0.5 bg-current" />
              </span>
            </div>
          </div>
        </button>

        <!-- Accordion Content -->
        <div
          :id="'exp-panel-' + exp.id"
          role="region"
          :aria-hidden="expandedId !== exp.id"
          class="accordion-wrapper"
          :class="{ 'is-open': expandedId === exp.id }"
        >
          <div class="accordion-inner">
            <div class="p-5 pt-4 space-y-4 bg-primary-500/5">
              <!-- Type & Date (mobile) -->
              <p class="font-mono text-xs uppercase tracking-wider text-neutral-500 sm:hidden">
                {{ getExperienceContent(exp).type }} · {{ formatDate(exp.startDate) }} - {{ exp.current ? t('experiences.present') : formatDate(exp.endDate!) }}
              </p>

              <!-- Technologies -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tech in exp.technologies"
                  :key="tech"
                  :class="cn(
                    'px-2.5 py-1 text-xs font-mono',
                    'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700',
                    'hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/30',
                    'transition-colors duration-150 cursor-default'
                  )"
                >
                  {{ tech }}
                </span>
              </div>

              <!-- Tasks -->
              <ul class="space-y-2.5">
                <li
                  v-for="(task, taskIndex) in getExperienceContent(exp).tasks"
                  :key="taskIndex"
                  class="flex items-start gap-2.5 text-neutral-600 dark:text-neutral-400"
                >
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span class="text-sm leading-relaxed">{{ task }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
