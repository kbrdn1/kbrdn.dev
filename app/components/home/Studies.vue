<script setup lang="ts">
import { useI18n } from '#imports'

const { t, locale } = useI18n()

interface Study {
  id: string
  key: string
  school: string
  logo: string
  level: string
  startDate: string
  endDate: string | null
  current: boolean
  technologies: string[]
  skillsCount: number
}

const studies: Study[] = [
  {
    id: 'mns-master',
    key: 'mnsMaster',
    school: 'Metz Numeric School',
    logo: '/images/logos/mns.jpeg',
    level: 'Master',
    startDate: '2023-10',
    endDate: '2025-10',
    current: false,
    technologies: ['C#/.NET', 'TypeScript', 'Node', 'Git', 'Docker', 'Kubernetes', 'Flutter', 'Hono.js', 'Prisma', 'Drizzle', 'Adonis.js'],
    skillsCount: 5,
  },
  {
    id: 'mns-licence',
    key: 'mnsLicence',
    school: 'Metz Numeric School',
    logo: '/images/logos/mns.jpeg',
    level: 'Licence',
    startDate: '2022-10',
    endDate: '2023-09',
    current: false,
    technologies: ['Figma', 'Java', 'Symfony', 'React', 'MongoDB', 'TypeScript', 'Node', 'Git', 'Docker', 'Vue', 'Angular'],
    skillsCount: 4,
  },
  {
    id: 'cci-bac2',
    key: 'cciBac2',
    school: 'CCI Longwy EESC',
    logo: '/images/logos/cci.jpg',
    level: 'BAC+2',
    startDate: '2020-10',
    endDate: '2022-06',
    current: false,
    technologies: ['HTML', 'CSS', 'PHP', 'JavaScript', 'SASS', 'jQuery', 'Symfony', 'Adobe XD', 'Photoshop', 'Illustrator', 'MySQL', 'Bootstrap', 'Git'],
    skillsCount: 5,
  }
]

const expandedId = ref<string | null>(studies[0].id)
const logoError = ref<Record<string, boolean>>({})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function getStudyContent(study: Study) {
  const skills = Array.from({ length: study.skillsCount }, (_, i) =>
    t(`studies.${study.key}.skills.${i}`)
  )
  return {
    degree: t(`studies.${study.key}.degree`),
    skills
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
    <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">{{ t('studies.title') }}</h2>

    <!-- Horizontal Accordions with Stagger Animation -->
    <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-2">
      <UiStaggerItem
        v-for="(study, index) in studies"
        :key="study.id"
        :index="index"
        class="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-hidden"
      >
        <!-- Accordion Header -->
        <button
          :class="cn(
            'group/header w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
            expandedId === study.id
              ? 'bg-primary-500/5 border-b border-neutral-200 dark:border-neutral-800'
              : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:border-l-2 hover:border-l-primary-500/50 hover:pl-[14px]'
          )"
          @click="toggleExpand(study.id)"
        >
          <!-- Logo -->
          <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <NuxtImg
              v-if="!logoError[study.id]"
              :src="study.logo"
              :alt="study.school"
              width="32"
              height="32"
              class="w-8 h-8 object-contain"
              @error="logoError[study.id] = true"
            />
            <span
              v-else
              class="w-8 h-8 flex items-center justify-center text-xs font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              {{ getInitials(study.school) }}
            </span>
          </div>

          <!-- School & Degree -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ study.school }}</span>
              <span class="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
                {{ study.level }}
              </span>
            </div>
            <p class="text-xs text-neutral-500 truncate">
              {{ getStudyContent(study).degree }}
            </p>
          </div>

          <!-- Date & Chevron -->
          <div class="flex items-center gap-2 text-xs text-neutral-500">
            <span class="hidden sm:inline">
              {{ formatDate(study.startDate) }} - {{ study.current ? t('studies.present') : formatDate(study.endDate!) }}
            </span>
            <UIcon
              :name="expandedId === study.id ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
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
          <div v-if="expandedId === study.id" class="overflow-hidden">
            <div class="p-4 space-y-3">
              <!-- Date (mobile) -->
              <p class="text-xs text-neutral-500 sm:hidden">
                {{ formatDate(study.startDate) }} - {{ study.current ? t('studies.present') : formatDate(study.endDate!) }}
              </p>

              <!-- Technologies -->
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tech in study.technologies"
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

              <!-- Skills -->
              <ul class="space-y-1.5 text-sm">
                <li
                  v-for="(skill, index) in getStudyContent(study).skills"
                  :key="index"
                  class="flex gap-2 text-neutral-600 dark:text-neutral-400"
                >
                  <span class="text-primary-500 flex-shrink-0">›</span>
                  <span class="leading-snug">{{ skill }}</span>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
