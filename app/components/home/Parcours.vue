<script setup lang="ts">
// The home's Parcours section, a short teaser of /experience: its timeline as a two-level
// tree, like a file explorer's. A role (its company's logo) and, branching off a guide line
// under it, its projects; then the degrees. The full story and the open source work live on
// /experience; the figures sit in the home's About.
import { useI18n } from '#imports'

const { t } = useI18n()

interface Row {
  id: string
  kind: 'role' | 'project' | 'degree'
  years: string
  name: string
  logo?: string
  detail: string
  /** A role with projects under it: its guide line runs down from the logo */
  parent?: boolean
  /** The last project of its role: the guide line turns into it and stops */
  last?: boolean
}

// The client, unless it is the product itself (Assmat Facile): then the role says more
const projectDetail = (p: (typeof PROJECTS)[number]) => {
  const client = t(`experiencePage.work.${p.key}.client`)
  return client === p.name ? t(`experiencePage.work.${p.key}.role`) : client
}

const rows = computed<Row[]>(() => [
  ...EXPERIENCES.flatMap((e): Row[] => {
    const projects = PROJECTS.filter((p) => p.parent === e.id)
    return [
      {
        id: e.id,
        kind: 'role',
        years: yearSpan(e.startDate, e.endDate),
        name: e.company,
        logo: e.logo,
        detail: t(`experiences.${e.key}.role`),
        parent: projects.length > 0,
      },
      ...projects.map((p, i): Row => ({
        id: p.id,
        kind: 'project',
        years: yearSpan(p.startDate, p.endDate),
        name: p.name,
        detail: projectDetail(p),
        last: i === projects.length - 1,
      })),
    ]
  }),
  ...STUDIES.map((s): Row => ({
    id: s.id,
    kind: 'degree',
    years: yearSpan(s.startDate, s.endDate),
    name: s.school,
    logo: s.logo,
    detail: `${s.level} · ${t(`studies.${s.key}.degree`)}`,
  })),
])
</script>

<template>
  <div>
    <p class="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      {{ t('experiencePage.teaser') }}
    </p>

    <ol class="mt-3">
      <li v-for="row in rows" :key="row.id">
        <NuxtLinkLocale
          :to="`/experience#${row.id}`"
          class="group relative isolate -mx-3 flex items-center gap-4 overflow-hidden px-3 py-2.5 transition-colors"
        >
          <UiPixelCanvas />
          <span class="eyebrow hidden w-24 shrink-0 tabular-nums sm:block">{{ row.years }}</span>
          <!-- The tree's first level: the logo, its guide line running down under it to the
               row's edge when projects follow -->
          <span
            v-if="row.kind !== 'project'"
            :class="
              cn(
                'tree-node -my-2.5 flex w-7 shrink-0 items-center self-stretch',
                row.parent && 'has-children',
              )
            "
          >
            <NuxtImg
              v-if="row.logo"
              :src="row.logo"
              alt=""
              width="28"
              height="28"
              class="size-7 rounded-lg object-cover ring-1 ring-(--card-border)"
            />
          </span>
          <!-- The second: a branch off the guide line, the last one turning into it -->
          <span
            v-else
            :class="cn('tree-branch -my-2.5 w-7 shrink-0 self-stretch', row.last && 'is-last')"
            aria-hidden="true"
          />
          <span class="min-w-0">
            <span
              :class="
                cn(
                  'block truncate text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100',
                  row.kind === 'project' ? 'text-[13px]' : 'text-sm',
                )
              "
            >
              {{ row.name }}
            </span>
            <span class="eyebrow block truncate sm:hidden">{{ row.years }}</span>
          </span>
          <span
            class="ml-auto hidden truncate text-xs text-neutral-500 md:block dark:text-neutral-400"
          >
            {{ row.detail }}
          </span>
        </NuxtLinkLocale>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* The guide lines, in the controls' outline colour, through the logos' centre (half of w-7). Each
   row draws its own piece over its whole height (its padding included, -my-2.5), so the pieces
   meet into one line */
.tree-node,
.tree-branch {
  position: relative;
}

.tree-node.has-children::after {
  content: '';
  position: absolute;
  top: calc(50% + 0.875rem);
  bottom: 0;
  left: 50%;
  border-left: 1px solid var(--control-border);
}

/* ├ the trunk through the row, and its branch to the name */
.tree-branch::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px solid var(--control-border);
}

.tree-branch::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -0.5rem;
  left: 50%;
  border-top: 1px solid var(--control-border);
}

/* └ the last: the trunk bends into the branch, rounded, and stops */
.tree-branch.is-last::before {
  bottom: 50%;
  width: calc(50% + 0.5rem);
  border-bottom: 1px solid var(--control-border);
  border-bottom-left-radius: 0.5rem;
}

.tree-branch.is-last::after {
  content: none;
}
</style>
