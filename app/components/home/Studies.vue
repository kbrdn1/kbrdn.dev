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
  <div>
    <!-- Accordions with Stagger Animation -->
    <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-4">
      <UiStaggerItem
        v-for="(study, index) in studies"
        :key="study.id"
        :index="index"
        class="border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
      >
        <!-- Accordion Header -->
        <button
          :id="'study-header-' + study.id"
          type="button"
          :aria-expanded="expandedId === study.id"
          :aria-controls="'study-panel-' + study.id"
          :class="cn(
            'group/header w-full flex items-center gap-4 p-5 text-left transition-all duration-300',
            expandedId === study.id
              ? 'bg-primary-500/5 border-b border-primary-500/20'
              : ''
          )"
          @click="toggleExpand(study.id)"
        >
          <!-- Logo -->
          <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <NuxtImg
              v-if="!logoError[study.id]"
              :src="study.logo"
              :alt="study.school"
              width="40"
              height="40"
              class="w-10 h-10 object-contain"
              @error="logoError[study.id] = true"
            />
            <span
              v-else
              class="w-10 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              {{ getInitials(study.school) }}
            </span>
          </div>

          <!-- School & Degree -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5">
              <span class="text-lg font-medium text-neutral-900 dark:text-neutral-100">{{ study.school }}</span>
              <span class="px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                {{ study.level }}
              </span>
            </div>
            <p class="text-sm text-neutral-400 truncate">
              {{ getStudyContent(study).degree }}
            </p>
          </div>

          <!-- Date & Chevron -->
          <div class="flex items-center gap-3">
            <span class="hidden sm:inline font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ formatDate(study.startDate) }} - {{ study.current ? t('studies.present') : formatDate(study.endDate!) }}
            </span>
            <div class="relative w-5 h-5 text-neutral-400 group-hover/header:text-primary-500" aria-hidden="true">
              <span class="absolute inset-0 flex items-center justify-center">
                <span class="block w-3 h-0.5 bg-current" />
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center accordion-icon-bar"
                :class="expandedId === study.id ? 'is-expanded' : 'is-collapsed'"
              >
                <span class="block w-3 h-0.5 bg-current" />
              </span>
            </div>
          </div>
        </button>

        <!-- Accordion Content -->
        <div
          :id="'study-panel-' + study.id"
          role="region"
          :aria-labelledby="'study-header-' + study.id"
          :aria-hidden="expandedId !== study.id"
          class="accordion-wrapper"
          :class="{ 'is-open': expandedId === study.id }"
        >
          <div class="accordion-inner">
            <div class="p-5 pt-4 space-y-4 bg-primary-500/5">
              <!-- Date (mobile) -->
              <p class="font-mono text-xs uppercase tracking-wider text-neutral-500 sm:hidden">
                {{ formatDate(study.startDate) }} - {{ study.current ? t('studies.present') : formatDate(study.endDate!) }}
              </p>

              <!-- Technologies -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tech in study.technologies"
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

              <!-- Skills -->
              <ul class="space-y-2.5">
                <li
                  v-for="(skill, skillIndex) in getStudyContent(study).skills"
                  :key="skillIndex"
                  class="flex items-start gap-2.5 text-neutral-600 dark:text-neutral-400"
                >
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span class="text-sm leading-relaxed">{{ skill }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
