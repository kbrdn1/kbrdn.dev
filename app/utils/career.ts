// The career and open source facts behind /experience and the home's Parcours teaser.
// Text lives in i18n (experiences.*, studies.*, experiencePage.openSource.*); this file
// only holds what does not translate: ids, dates, stacks, links. Open source entries are
// facts checked on GitHub: `merged` and `review` are pull requests, `report` an issue.

export interface Experience {
  id: string
  key: string
  company: string
  logo: string
  startDate: string
  endDate: string | null
  technologies: string[]
  tasksCount: number
  /** An illustration beside the summary (public/images/projects) */
  image?: string
}

export interface Study {
  id: string
  key: string
  school: string
  logo: string
  level: string
  startDate: string
  endDate: string | null
  technologies: string[]
  skillsCount: number
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'flippad',
    key: 'flippad',
    company: 'Jewely x Flippad',
    logo: '/images/logos/jewely-x-flippad.png',
    // flippad.com and jewely.fr, cut on the bias
    image: '/images/projects/jewely-x-flippad.webp',
    startDate: '2023-10',
    endDate: '2026-09',
    technologies: [
      'Laravel',
      'Vue',
      'Nuxt',
      'AWS',
      'React',
      'Symfony',
      'Redis',
      'Stripe',
      'Hono.js',
      'Prisma',
    ],
    tasksCount: 3,
  },
  {
    id: 'virtual-immersion',
    key: 'virtualImmersion',
    company: 'Virtual Immersion',
    logo: '/images/logos/virtual-immersion.png',
    startDate: '2022-11',
    endDate: '2023-09',
    technologies: ['Symfony', 'Laravel', 'React', 'WordPress', 'MySQL', 'Tailwind CSS'],
    tasksCount: 4,
  },
]

// The projects of a role, shown under it on /experience (after isrod.eu's "↳" entries).
// Only Kylian's own share of each, checked in the repositories' history: the products of
// clients he worked on, not tooling. Text in experiencePage.work.<key>.
export interface Project {
  id: string
  key: string
  /** The Experience it belongs to */
  parent: string
  name: string
  startDate: string
  endDate: string | null
  technologies: string[]
  highlightsCount: number
  /** Public site, when the product has one */
  site?: string
  /** Content path of a blog post about it ("To read") */
  article?: string
  /** An illustration: its public site, its README or its maker's site (public/images/projects) */
  image?: string
}

// Most recent first, like the strip
export const PROJECTS: Project[] = [
  {
    id: 'jewely-ecommerce',
    key: 'jewelyEcommerce',
    parent: 'flippad',
    name: 'Jewely E-commerce',
    startDate: '2026-06',
    endDate: '2026-09',
    technologies: [
      'Laravel 13',
      'PHP 8.5',
      'Vue 3',
      'Inertia',
      'TypeScript',
      'MySQL',
      'Redis',
      'Docker Swarm',
      'GitHub Actions',
    ],
    highlightsCount: 4,
    image: '/images/projects/jewely-ecommerce.webp',
  },
  {
    id: 'fiches-pedagogiques',
    key: 'fichesPedagogiques',
    parent: 'flippad',
    name: 'Fiches Pédagogiques',
    startDate: '2024-10',
    endDate: '2026-09',
    technologies: [
      'Laravel 13',
      'PHP 8.5',
      'MySQL',
      'Redis',
      'Elasticsearch',
      'Stripe',
      'Nuxt 4',
      'TypeScript',
      'Go',
      'AWS',
    ],
    highlightsCount: 4,
    site: 'https://www.fichespedagogiques.com',
    article: '/blogs/fiches-pedagogiques',
    image: '/images/projects/fiches-pedagogiques.webp',
  },
  {
    id: 'jewely-configurator',
    key: 'jewelyConfigurator',
    parent: 'flippad',
    name: 'Jewely Configurator',
    startDate: '2024-04',
    endDate: '2024-10',
    technologies: [
      'Vue 3',
      'Pinia',
      'Panda CSS',
      'Hono',
      'Prisma',
      'AWS Lambda',
      'WooCommerce',
      'Bun',
    ],
    highlightsCount: 3,
    image: '/images/projects/jewely-configurator.webp',
  },
  {
    id: 'assmat-facile',
    key: 'assmatFacile',
    parent: 'flippad',
    name: 'Assmat Facile',
    startDate: '2024-01',
    endDate: '2026-06',
    technologies: [
      'Symfony 5.4',
      'PHP 8.1',
      'Doctrine',
      'MySQL',
      'Stripe',
      'React',
      'TypeScript',
      'Heroku',
    ],
    highlightsCount: 4,
    site: 'https://www.assmat-facile.fr',
    image: '/images/projects/assmat-facile.webp',
  },
  {
    id: 'jewely-erp',
    key: 'jewelyErp',
    parent: 'flippad',
    name: 'Jewely ERP',
    startDate: '2023-10',
    endDate: '2024-01',
    technologies: ['Laravel', 'Vue 3', 'Vuex', 'MariaDB', 'Sanctum', 'Alma', 'Docker', 'AWS'],
    highlightsCount: 3,
    image: '/images/projects/jewely-erp.webp',
  },
]

export const STUDIES: Study[] = [
  {
    id: 'mns-master',
    key: 'mnsMaster',
    school: 'Metz Numeric School',
    logo: '/images/logos/mns.jpeg',
    level: 'Master',
    startDate: '2023-10',
    endDate: '2025-10',
    technologies: [
      'C#/.NET',
      'TypeScript',
      'Node',
      'Git',
      'Docker',
      'Kubernetes',
      'Flutter',
      'Hono.js',
      'Prisma',
      'Drizzle',
      'Adonis.js',
    ],
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
    technologies: [
      'Figma',
      'Java',
      'Symfony',
      'React',
      'MongoDB',
      'TypeScript',
      'Node',
      'Git',
      'Docker',
      'Vue',
      'Angular',
    ],
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
    technologies: [
      'HTML',
      'CSS',
      'PHP',
      'JavaScript',
      'SASS',
      'jQuery',
      'Symfony',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
      'MySQL',
      'Bootstrap',
      'Git',
    ],
    skillsCount: 5,
  },
]

/** Projects I maintain on GitHub; `status` is the site's label, not the repository's. */
export const OPEN_SOURCE_PROJECTS = [
  {
    key: 'gwm',
    name: 'gwm',
    language: 'Rust',
    status: 'released',
    repo: 'https://github.com/kbrdn1/gwm-cli',
    site: 'https://gwm.kbrdn.dev',
    // Install channels listed in the gwm-cli README
    channels: ['crates.io', 'Homebrew', 'Scoop', 'aqua', 'Nix', '.deb', '.rpm', 'AUR'],
  },
  {
    key: 'vellum',
    name: 'vellum',
    language: 'Rust',
    status: 'inDevelopment',
    repo: 'https://github.com/kbrdn1/vellum',
  },
  {
    key: 'lazycurl',
    name: 'LazyCurl',
    language: 'Go',
    status: 'archived',
    repo: 'https://github.com/kbrdn1/LazyCurl',
  },
  {
    key: 'herdrPluginGwm',
    name: 'herdr-plugin-gwm',
    language: 'Shell',
    status: 'released',
    repo: 'https://github.com/kbrdn1/herdr-plugin-gwm',
  },
  {
    key: 'claudeCrosstalk',
    name: 'claude-crosstalk',
    language: 'TypeScript',
    status: 'released',
    repo: 'https://github.com/kbrdn1/claude-crosstalk',
  },
  {
    key: 'kbrdnDocs',
    name: 'kbrdn-docs',
    language: 'Astro',
    status: 'released',
    repo: 'https://github.com/kbrdn1/kbrdn-docs',
  },
] as const

/** Pull requests and issues sent to projects I don't maintain, checked on GitHub. */
export const UPSTREAM = [
  {
    key: 'winget',
    repo: 'microsoft/winget-pkgs',
    kind: 'merged',
    url: 'https://github.com/microsoft/winget-pkgs/pull/403295',
  },
  {
    key: 'aqua',
    repo: 'aquaproj/aqua-registry',
    kind: 'merged',
    url: 'https://github.com/aquaproj/aqua-registry/pull/57117',
  },
  {
    key: 'awesomeRatatui',
    repo: 'ratatui/awesome-ratatui',
    kind: 'merged',
    url: 'https://github.com/ratatui/awesome-ratatui/pull/403',
  },
  {
    key: 'nixpkgs',
    repo: 'NixOS/nixpkgs',
    kind: 'review',
    url: 'https://github.com/NixOS/nixpkgs/pull/545222',
  },
  {
    key: 'snacks',
    repo: 'folke/snacks.nvim',
    kind: 'report',
    url: 'https://github.com/folke/snacks.nvim/issues/2689',
  },
  {
    key: 'codexbar',
    repo: 'steipete/CodexBar',
    kind: 'report',
    url: 'https://github.com/steipete/CodexBar/issues/420',
  },
  {
    key: 'terminalBrowser',
    repo: 'zenbu-labs/terminal-browser',
    kind: 'report',
    url: 'https://github.com/zenbu-labs/terminal-browser/issues/85',
  },
  {
    key: 'elasticlens',
    repo: 'pdphilip/elasticlens',
    kind: 'report',
    url: 'https://github.com/pdphilip/elasticlens/issues/16',
  },
] as const

/** "oct. 2023" / "Oct 2023" */
export function formatMonth(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    year: 'numeric',
  })
}
