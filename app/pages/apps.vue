<script setup lang="ts">
// /apps: the terminal apps, with their status as the site states it (LazyCurl is
// "archived" here, its repository is untouched) and their latest release read live
// from GitHub. Features and install commands come from each README.
import { useI18n } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('appsPage.seoTitle'),
  description: () => t('appsPage.seoDescription'),
  ogTitle: () => t('appsPage.seoTitle'),
  ogDescription: () => t('appsPage.seoDescription'),
  twitterCard: 'summary_large_image',
})

if (import.meta.server) {
  defineOgImage('Default', {
    title: t('appsPage.ogTitle'),
    subtitle: t('appsPage.ogSubtitle'),
    statusText: t('hero.availableForHire'),
    avatarUrl: `${useRequestURL().origin}/images/avatar.png`,
  })
}

const RAW = 'https://raw.githubusercontent.com/kbrdn1'
const APPS = [
  {
    key: 'gwm',
    name: 'gwm',
    repo: 'gwm-cli',
    language: 'Rust',
    license: 'Apache-2.0',
    status: 'released',
    site: 'https://gwm.kbrdn.dev',
    logo: {
      dark: `${RAW}/gwm-cli/HEAD/docs/_assets/logo.svg`,
      light: `${RAW}/gwm-cli/HEAD/docs/_assets/logo-light.svg`,
    },
    icon: 'i-simple-icons-rust',
    features: 4,
    // From the gwm-cli README's install table
    install: [
      'brew tap kbrdn1/tap && brew install gwm',
      'cargo install gwm-cli',
      'scoop bucket add gwm https://github.com/kbrdn1/scoop-gwm; scoop install gwm',
      'nix profile install github:kbrdn1/gwm-cli',
      'aqua g -i kbrdn1/gwm-cli',
    ],
  },
  {
    key: 'vellum',
    name: 'vellum',
    repo: 'vellum',
    language: 'Rust',
    license: 'MIT',
    status: 'inDevelopment',
    icon: 'i-simple-icons-rust',
    features: 3,
  },
  {
    key: 'lazycurl',
    name: 'LazyCurl',
    repo: 'LazyCurl',
    language: 'Go',
    license: 'MIT',
    status: 'archived',
    icon: 'i-simple-icons-go',
    features: 4,
  },
] as const

const { data: releases } = useFetch<Record<string, { version: string } | null>>(
  '/api/github/releases',
  { server: false, lazy: true, default: () => ({}) },
)

const STATUS_CLASS: Record<string, string> = {
  released:
    'text-green-700 dark:text-green-500 border-green-600/40 dark:border-green-500/30 bg-green-600/5 dark:bg-green-500/5',
  inDevelopment: 'text-primary-500 border-primary-500/40 bg-primary-500/5',
  archived: 'text-neutral-500 border-neutral-300 dark:border-neutral-700 bg-neutral-500/5',
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-6 pb-20">
    <section class="pt-14 pb-10">
      <p class="font-mono text-[11px] uppercase tracking-widest text-primary-500">
        {{ t('appsPage.eyebrow') }}
      </p>
      <h1
        class="mt-4 max-w-3xl text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl dark:text-neutral-100"
        :aria-label="t('appsPage.title')"
      >
        <UiScrambleText :text="t('appsPage.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('appsPage.intro') }}
      </p>
    </section>

    <div class="space-y-6">
      <article
        v-for="app in APPS"
        :id="app.key"
        :key="app.key"
        class="relative isolate grid scroll-mt-24 gap-8 overflow-hidden border border-neutral-200 bg-white/50 p-6 transition-colors hover:border-primary-500/50 sm:p-8 md:grid-cols-12 dark:border-neutral-800 dark:bg-neutral-950/50"
        :class="{ 'opacity-80': app.status === 'archived' }"
      >
        <UiPixelCanvas />

        <header class="md:col-span-5">
          <div class="flex items-center gap-3">
            <template v-if="'logo' in app">
              <img
                :src="app.logo.light"
                alt=""
                width="40"
                height="40"
                class="size-10 dark:hidden"
              />
              <img
                :src="app.logo.dark"
                alt=""
                width="40"
                height="40"
                class="hidden size-10 dark:block"
              />
            </template>
            <UIcon v-else :name="app.icon" class="size-10 text-neutral-500" aria-hidden="true" />
            <h2 class="font-mono text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              <UiScrambleText :text="app.name" />
            </h2>
          </div>
          <p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t(`appsPage.apps.${app.key}.tagline`) }}
          </p>
          <div
            class="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
          >
            <span :class="cn('border px-2 py-0.5', STATUS_CLASS[app.status])">
              {{ t(`appsPage.status.${app.status}`) }}
            </span>
            <span
              v-if="releases?.[app.repo]?.version"
              class="border border-neutral-300 px-2 py-0.5 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
            >
              {{ releases[app.repo]!.version }}
            </span>
            <span class="text-neutral-500">{{ app.language }} · {{ app.license }}</span>
          </div>
          <div class="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wider">
            <a
              v-if="'site' in app"
              :href="app.site"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 text-primary-500 hover:text-primary-400"
            >
              <UiScrambleText :text="t('appsPage.site')" effect="link" /> ↗
            </a>
            <a
              :href="`https://github.com/kbrdn1/${app.repo}`"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 text-neutral-500 hover:text-primary-500"
            >
              <UiScrambleText :text="t('appsPage.repo')" effect="link" /> ↗
            </a>
            <a
              v-if="app.status !== 'inDevelopment'"
              :href="`https://github.com/kbrdn1/${app.repo}/releases`"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 text-neutral-500 hover:text-primary-500"
            >
              <UiScrambleText :text="t('appsPage.releases')" effect="link" /> ↗
            </a>
          </div>
        </header>

        <div class="space-y-6 md:col-span-7">
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {{ t(`appsPage.apps.${app.key}.description`) }}
          </p>
          <ul class="space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            <li v-for="i in app.features" :key="i" class="flex gap-2">
              <span class="mt-2 size-1.5 shrink-0 bg-primary-500" aria-hidden="true" />
              <span>{{ t(`appsPage.apps.${app.key}.features.${i - 1}`) }}</span>
            </li>
          </ul>
          <div v-if="'install' in app">
            <h3 class="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              {{ t('appsPage.install') }}
            </h3>
            <pre
              class="relative z-10 mt-2 overflow-x-auto border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            ><code><span v-for="line in app.install" :key="line" class="block"><span class="select-none text-primary-500">$ </span>{{ line }}</span></code></pre>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
