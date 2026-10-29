export default {
  // Banner
  banner: {
    gwm: 'Check out gwm: Git Worktree Manager (CLI + TUI)',
  },

  // Common
  common: {
    showMore: 'Show more',
    showLess: 'Show less',
    loading: 'Loading...',
    newTab: 'opens in a new tab',
  },

  // SEO
  seo: {
    title: 'Kylian Bardini · Full Stack Developer',
    description:
      'Kylian Bardini, full stack developer in Nancy: TypeScript, Nuxt, Laravel, AWS and Rust. His journey, his open source terminal tools and his articles.',
    jobTitle: 'Full Stack Developer',
  },

  // Hero Section
  hero: {
    defaultTitle: '1/3 Design Engineer',
    viewCount: 'views',
    sponsor: 'Sponsor',
    availableForHire: 'Open to opportunities',
    contact: 'Get in touch',
    bookCallTip: 'Schedule a 30-min meeting to discuss your project',
  },

  // Hero easter egg: the gitfut card's walkout (HomeWalkout)
  walkout: {
    skip: 'Press {key} to skip',
    back: 'Press {key} to go back',
    enter: 'Enter',
    escape: 'Esc',
    card: 'gitfut card of {name}: {details}.',
    rating: 'rated {n}',
    position: 'position {p}',
    language: 'language {l}',
  },

  // Navigation
  nav: {
    home: 'Home',
    experience: 'Journey',
    apps: 'Apps',
    activity: 'Activity',
    blog: 'Blog',
    contact: 'Contact',
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch language',
    site: 'Site navigation',
    siteMobile: 'Mobile site navigation',
  },

  // The navbar's notch menus
  navMenu: {
    home: 'The portfolio at a glance: who I am, what I write, what I use and what I build.',
    experience: 'Three years at Jewely x Flippad and their projects, the degrees, the open source.',
    apps: 'The terminal tools I publish, in Rust and Go.',
    activity: 'The open source and the recent GitHub activity, read live.',
    blog: 'The latest posts, and all the others.',
    contact: 'A role, a project, a question: a short message is enough.',
    gwm: 'The git worktree manager, CLI and TUI, in Rust: a single binary, no git CLI needed.',
    gwmApps: 'On the Apps page',
  },

  // Theme toggle
  themeSwitch: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    toBlur: 'Switch to glass mode',
  },

  // The pause control (components/ui/MotionToggle)
  motion: {
    pause: 'Pause animations',
  },

  // Section Labels
  sections: {
    about: 'ABOUT',
    projects: 'PROJECTS',
    skills: 'STACK & SKILLS',
    parcours: 'JOURNEY',
    activity: 'ACTIVITY',
    blog: 'BLOG',
    sponsor: 'Sponsor on GitHub',
  },

  // Explore Section
  explore: {
    title: 'Explore',
    previous: 'Previous',
    next: 'Next',
    labels: {
      collab: 'Collaboration',
      crafting: 'Projects',
      blog: 'Blog',
      sponsor: 'Sponsor',
      motto: 'Philosophy',
    },
    slides: {
      collab: {
        title: "Let's build something together",
        description:
          "I'm always open to interesting projects and collaborations. Whether it's a web app, an API, or a full-stack product, let's talk.",
        cta: 'Get in touch',
      },
      crafting: {
        title: 'Currently crafting...',
        description:
          'gwm, a Git Worktree Manager (CLI + TUI) built in Rust. Also working on this portfolio, cloud architecture experiments, and diving deeper into Rust.',
      },
      blog: {
        title: 'Read my articles',
        description:
          'I write about web development, architecture patterns, tools I use, and lessons learned building real-world projects.',
        cta: 'Browse articles',
      },
      sponsor: {
        title: 'Support my work',
        description:
          'If you find my open-source projects useful, consider sponsoring me on GitHub. Every contribution helps me keep building.',
        cta: 'Sponsor on GitHub',
      },
      motto: {
        title: '"The right tool, not the trendy one."',
        description:
          'I believe in pragmatic engineering. Pick the stack that fits the problem, write code that lasts, and ship things that matter.',
      },
    },
  },

  // Music Section
  music: {
    listeningTo: 'Listening to',
    openPlayer: 'Open the player',
    closePlayer: 'Close the player',
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous track',
    next: 'Next track',
    shuffleOn: 'Enable shuffle',
    shuffleOff: 'Disable shuffle',
    showList: 'Show tracklist',
    hideList: 'Hide tracklist',
    progress: 'Track progress',
    timeOf: '{current} of {total}',
    track: 'Track {n} of {total}',
    // Fixed names for the toggles: their state is aria-pressed / aria-expanded
    shuffle: 'Shuffle',
    tracklist: 'Tracklist',
  },

  // Article reader (speech synthesis)
  listen: {
    listen: 'Listen to the article',
    from: 'Listen from here',
    pause: 'Pause',
    // Not the table of contents' "reading progress", which follows the scroll
    progress: 'Listening progress',
    sentenceOf: 'Sentence {n} of {total}',
    voice: 'Voice: {name}',
  },

  // Bio Section
  bio: {
    title: 'About',
    defaultParagraphs: [
      "Hey, I'm Kylian, a full stack developer who loves building clean, modern websites and apps where design, functionality, and even the smallest details matter, with a focus on making products that are both practical and visually satisfying.",
      "Tech stack isn't my concern, I'm flexible with whatever the project needs, though I prefer modern frameworks and tools. I'm always open for new opportunities to learn and grow.",
    ],
    paragraph1:
      "Hey, I'm Kylian, a full stack developer who loves building clean, modern websites and apps where design, functionality, and even the smallest details matter, with a focus on making products that are both practical and visually satisfying.",
    paragraph2:
      'Currently focused on building solid, scalable architectures. I enjoy exploring new languages and tools, from Rust to cloud infrastructure, always looking for the right solution, not just the trendy one.',
  },

  // Actions Section
  actions: {
    bookCall: 'Book a call',
    sendEmail: 'Send an email',
  },

  // Socials Section
  socials: {
    github: 'GitHub',
    githubDesc: 'Open-source projects & contributions',
    twitter: 'Twitter',
    twitterDesc: 'Thoughts on tech & dev',
    linkedin: 'LinkedIn',
    linkedinDesc: 'Professional profile & experience',
    medium: 'Medium',
    behance: 'Behance',
    visitProfile: 'Visit profile',
  },

  // GitHub Chart
  github: {
    title: 'GitHub Activity',
    lastYear: 'Last 12 months',
    loading: 'Loading contributions...',
    error: 'Unable to load contribution data',
    totalContributions: 'Total Contributions',
    dailyAverage: 'Daily Average',
    perDay: '/ day',
    contributions: 'CONTRIBUTIONS',
    tabs: {
      recent: 'Recent',
      annual: 'Annual',
      monthly: 'Monthly',
    },
    tabsLabel: 'Contribution view',
    viewProfile: 'View GitHub profile',
    // The tooltip: "3 on Mon, Oct 12, 2026"
    on: 'on',
  },

  // Theme
  theme: {
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System',
  },

  // Language
  language: {
    en: 'English',
    fr: 'French',
  },

  // Skills Section
  skills: {
    title: 'Tools I work with',
    stack: {
      languages: 'Languages',
      frontend: 'Frontend',
      backend: 'Backend',
      infrastructure: 'Infrastructure',
      workflow: 'Workflow',
    },
  },

  // Projects Section
  projects: {
    title: 'Featured Projects',
    tabs: { perso: 'Personal', pro: 'Work' },
    next: { eyebrow: 'Up next', text: 'The next project, maybe yours' },
    viewAll: 'View all on GitHub',
    demo: 'Demo',
    stats: {
      stars: 'Stars',
      forks: 'Forks',
      downloads: 'Downloads',
      usedBy: 'Used By',
      lighthouse: 'Lighthouse',
      loadTime: 'Load Time',
    },
  },

  // Experiences Section
  experiences: {
    title: 'Experience',
    present: 'Present',
    current: 'Current',
    flippad: {
      role: 'Full Stack Engineer',
      type: 'Full-time (formerly apprenticeship)',
      tasks: [
        'Production and pre-production deployment on AWS and Heroku via GitHub Actions (API Gateway, Lambda, EC2, S3, CloudWatch, etc.)',
        'Upgrades of the products (Laravel 12 then 13, PHP 8.5) and of their dependencies',
        'SemVer versioning, a changelog per version and release procedures, with the CI that goes with them',
      ],
    },
    virtualImmersion: {
      role: 'Full Stack Developer',
      type: 'Apprenticeship',
      tasks: [
        'Building an API for file management with Symfony',
        'Implementation of mixed reality immersion on WordPress',
        'Application of software architecture principles (Onion, MVC, CRUD, Atomic, etc.)',
        'Creation of map navigation for an animal park with React',
      ],
    },
  },

  // Studies Section
  studies: {
    title: 'Education',
    present: 'Present',
    mnsMaster: {
      degree: 'Computer Engineering',
      skills: [
        'Clean code, advanced software architecture and microservices (DDD, Clean, BDD, TDD, Onion, SOLID, etc.)',
        'Frameworks and programming languages for developing Web Apps, mobile and desktop applications',
        'Testing (unit, integration, regression, performance tests, etc.)',
        'Continuous integration and continuous deployment',
        'Project management as project lead for 2 years for degree completion',
      ],
    },
    mnsLicence: {
      degree: 'Full Stack Developer',
      skills: [
        'In-depth knowledge of UI & UX Design and Figma usage (mockup design)',
        'Frameworks and programming languages for developing Web Apps, mobile and desktop applications',
        'Application of software architecture principles (Onion, MVC, CRUD, Atomic, etc.)',
        'Project management as project lead for 1 year for degree completion',
      ],
    },
    cciBac2: {
      degree: 'Web and Mobile Web Developer',
      skills: [
        'Programming and algorithm fundamentals',
        'Basic web languages',
        'Software architecture (MVC, CRUD)',
        'UI & UX Design fundamentals and Adobe suite usage (mockup and brand identity design)',
        '4-week internship at House & Garden, building their website with Symfony',
      ],
    },
  },

  // Blog Navigation
  // /experience
  experiencePage: {
    seoTitle: 'Journey and open source · Kylian Bardini',
    seoDescription:
      'The journey of Kylian Bardini, full stack developer: Jewely x Flippad, Virtual Immersion, Metz Numeric School, and the open source tools he publishes (gwm, vellum, LazyCurl).',
    ogTitle: 'Journey',
    ogSubtitle: 'Experience, education and open source',
    eyebrow: 'JOURNEY',
    title: 'Full stack developer, from code to production.',
    intro:
      'Nearly four years in companies, starting as a work-study student: an ERP and back offices in Laravel and Symfony, front ends in Vue, Nuxt and React, deployed on AWS and Heroku. On the side, open source tools for the terminal, in Rust and Go.',
    ctaOpenSource: 'See the open source',
    ctaBlog: 'Read the blog',
    timeline: 'Roles and education',
    timelineCompact: 'Roles and education, quick access',
    experienceLabel: 'Experience',
    educationLabel: 'Education',
    stack: 'Stack',
    missions: 'Missions',
    skills: 'Learned',
    cv: {
      title: 'CV',
      text: 'The journey on one page, up to date, as a PDF.',
      download: 'Download the CV',
    },
    figures: {
      years: 'Years at work',
      projects: 'Client projects',
      openSource: 'Open source tools',
      studies: 'Degrees',
    },
    highlights: 'What I did',
    work: {
      jewelyEcommerce: {
        client: 'Louis Julian and Crown DP',
        role: 'Takeover and evolution',
        summary:
          "Jewely's multi-shop e-commerce CMS, which runs the sites of the Louis Julian and Crown DP watch and jewellery stores. Taken over in June 2026 on an existing codebase: I set it up to ship, upgraded it and kept it moving until I left.",
        highlights: [
          'SemVer versioning, a changelog per version and a release procedure: from v1.0.0 to v1.11.1 in three months',
          'Upgrade to Laravel 13 and PHP 8.5, Inertia 3 and Vite 7, move to Bun',
          "Features and payment gateways switched on shop by shop, integration of a watch brand's stock API",
          'SEO recovered (sitemap, redirects of the old URLs, structured data), a dashboard in strict TypeScript, a test CI',
        ],
      },
      fichesPedagogiques: {
        client: 'Martin Media',
        role: 'Project lead and back-end developer',
        summary:
          'A platform of teaching resources for primary school, from nursery to the last year: a catalogue of worksheets, search, sales and subscriptions, school licences and a back office. Rebuilt from scratch: I created the API and wrote most of it, then took over a large part of the front end in 2026.',
        highlights: [
          'The rebuild went live with v1.0.0 in May 2026, 63 versions released with their changelog on the API',
          'Migration of the old database, several million records in about an hour, by a tool rewritten in Go',
          'Elasticsearch search with a French analyser, Stripe subscriptions with idempotent webhooks, school licences and administrative mandates',
          'Two-factor authentication, Google sign-in, FFmpeg and PDF previews, upgrades to Laravel 12 then 13',
        ],
        site: 'fichespedagogiques.com',
        article: 'The article on the rebuild',
      },
      jewelyConfigurator: {
        client: 'Jewely',
        role: 'Design and development',
        summary:
          'A multi-brand jewellery configurator shipped as a WordPress plugin: customers customise a piece, see the price change in real time and add it to the WooCommerce cart. Built nearly alone, from the plugin to the API.',
        highlights: [
          'Three apps in one Bun monorepo: the plugin, the back office and the API',
          'A back office for brands, collections, models, configurations and size guides',
          "A serverless API in Hono and Prisma on AWS Lambda, wired to WooCommerce's REST API",
        ],
      },
      assmatFacile: {
        client: 'Assmat Facile',
        role: 'Full stack developer',
        summary:
          'A web app for parents who employ a childminder: contracts, payslips, payments, calculators and subscriptions. Taken over on an existing codebase: I built its back office and reworked the payments.',
        highlights: [
          'An admin back office: users, finance and refunds, statistics (revenue, churn, payments), exports and an annual report',
          'Subscription by administrative mandate for childcare networks: purchase orders and invoices as PDF, emails, scheduled jobs',
          'The checkout and the Stripe webhooks reworked, gross and net amounts',
          'Yearly update of the regulatory figures (minimum wage, contribution rates) until 2026',
        ],
        site: 'assmat-facile.fr',
      },
      jewelyErp: {
        client: 'Jewely',
        role: 'Full stack developer, work-study',
        summary:
          "Jewely's ERP for luxury jewellers: stock, sales, repairs, customers, invoicing and reporting, deployed for each client. My first months at Flippad, on the API and the screens.",
        highlights: [
          'API endpoints: employees, suppliers, categories, locations, product images, repairs and orders',
          'The orders and repairs screens',
          'Instalment payments with Alma, payment requests by SMS and email',
        ],
      },
    },
    summaries: {
      flippad:
        'Three years at Jewely x Flippad, first as a work-study student, then full time: an ERP for luxury jewellers, a multi-brand jewellery configurator, the Assmat-Facile back office, the Fiches Pédagogiques rebuild, then the Jewely e-commerce takeover, deployed on AWS and Heroku through GitHub Actions. Each project follows.',
      virtualImmersion:
        'A work-study year at Virtual Immersion: a file management API in Symfony, mixed reality on WordPress and the map navigation of an animal park in React.',
      mnsMaster:
        'Software engineering: advanced software architecture and microservices, testing at every level, continuous integration and delivery, and two years of project management for the degree.',
      mnsLicence:
        'Full stack developer: UI and UX with Figma, web, mobile and desktop frameworks, software architecture principles, and a year of project management for the degree.',
      cciBac2:
        'Web and mobile web developer: programming and web basics, MVC architecture, UI and UX with the Adobe suite, and an internship at House & Garden.',
    },
    openSource: {
      eyebrow: 'OPEN SOURCE',
      title: 'Tools for the terminal, published and maintained.',
      intro:
        'What I publish on GitHub, and what I send back to the projects I use: packages to ship gwm, and bugs reported upstream.',
      projectsLabel: 'Maintained projects',
      upstreamLabel: 'Contributions',
      reportsLabel: 'Reports',
      lot: 'LOT',
      install: 'Install:',
      site: 'Site',
      repo: 'Repository',
      viewAll: 'See everything on GitHub',
      search: 'Search…',
      noResults: 'No results',
      view: 'View',
      status: {
        released: 'Released',
        inDevelopment: 'In development',
        archived: 'Archived',
        merged: 'Merged',
        review: 'In review',
        report: 'Issue',
      },
      projects: {
        gwm: 'Git worktree manager for the terminal, CLI and TUI in Rust: it creates the worktree, runs the project setup, links the issue and shows which AI agent is working where. A single binary, no git CLI needed.',
        vellum:
          'TUI SQL client: browse, query and edit a database in the terminal, with a GitHub-like diff for every write. Rust and ratatui, local-first.',
        lazycurl: 'TUI HTTP client in Go, in the spirit of lazygit.',
        herdrPluginGwm:
          'herdr plugin that drives gwm for worktree management: gwm stays the source of truth, herdr follows.',
        claudeCrosstalk:
          'A Claude mod to read and join the conversations between several Claude Code sessions.',
        kbrdnDocs: 'Multi-product documentation monorepo, Astro Starlight and Bun workspaces.',
      },
      upstream: {
        winget: "gwm's manifest in the winget repository",
        aqua: 'gwm added to the aqua registry',
        awesomeRatatui: 'gwm in the awesome-ratatui list',
        nixpkgs: 'The gwm package for nixpkgs',
        snacks: 'gh_start_review fails with HTTP 422 when headRefOid is empty',
        codexbar: 'Helium browser cookies are not found',
        terminalBrowser: 'Let a TUI host provide a target rectangle instead of a whole pane',
        elasticlens: 'Laravel 13 support blocked by a pdphilip/omniterm constraint',
      },
    },
    availability: 'A project, a role, a question: a message is enough.',
    teaser: 'Experience, education and open source: the details are on the journey page.',
    teaserCta: 'See the journey',
  },

  // /contact
  contactPage: {
    seoTitle: 'Contact · Kylian Bardini',
    seoDescription:
      'Write to Kylian Bardini, full stack developer in Nancy: a role, a project or a question.',
    ogTitle: 'Contact',
    ogSubtitle: 'A role, a project, a question',
    eyebrow: 'CONTACT',
    title: 'Write to me.',
    intro: 'For a role, a project or a precise question. A short message is enough.',
    formTitle: 'Share the context',
    formSubtitle: 'A short message is enough',
    company: 'Company or product',
    companyPlaceholder: 'Optional',
    optional: 'optional',
    requiredHint: 'All fields are required unless marked optional.',
    topic: 'Topic',
    topics: {
      role: 'A role',
      project: 'A project',
      openSource: 'Open source',
      other: 'Something else',
    },
    details: 'Details',
    location: 'Location',
    availability: 'Availability',
    email: 'Email',
    socials: 'Elsewhere',
    cv: 'CV',
    cvDownload: 'Download (PDF)',
    write: 'Write a message',
  },

  // /activity
  activityPage: {
    now: {
      title: 'Right now',
      learning: 'Learning',
      gameDev: 'Game development',
      reading: 'Reading',
      symposium: 'The Symposium',
      plato: 'Plato',
      openTo: 'Open to',
      role: 'A role',
      project: 'A project',
      write: 'Write a message',
    },
    seoTitle: 'Activity · Kylian Bardini',
    seoDescription:
      "Kylian Bardini's open source work and recent GitHub activity, read live from his public repositories.",
    ogTitle: 'Activity',
    ogSubtitle: 'Open source and GitHub activity',
    eyebrow: 'ACTIVITY',
    title: "What's moving right now.",
    intro:
      'The tools I maintain, what I send back to the projects I use, and the recent activity of my public GitHub repositories, read live.',
    lastActivity: 'last public activity {ago}',
    checked: 'GitHub checked at {time}',
    feedTitle: 'Recent GitHub activity',
    feedCount: '{count} entries',
    feedEmpty: 'Nothing public on GitHub lately.',
    more: 'More on GitHub',
    showMore: 'Show more',
    today: 'Today',
    yesterday: 'Yesterday',
    types: {
      push: 'push',
      pr: 'pr',
      issue: 'issue',
      comment: 'comment',
      release: 'release',
      create: 'create',
      star: 'star',
      fork: 'fork',
    },
    events: {
      push: 'pushed to {ref}',
      pushes: '{count} pushes to {ref}',
      pr: {
        opened: 'opened PR #{number}',
        merged: 'merged PR #{number}',
        closed: 'closed PR #{number}',
        reopened: 'reopened PR #{number}',
      },
      issue: {
        opened: 'opened issue #{number}',
        closed: 'closed issue #{number}',
        reopened: 'reopened issue #{number}',
      },
      comment: 'commented on #{number}',
      comments: '{count} comments on #{number}',
      release: 'released {ref}',
      repository: 'created the repository',
      tag: 'created tag {ref}',
      star: 'starred',
      fork: 'forked',
    },
  },

  // /apps
  appsPage: {
    seoTitle: 'Apps · Kylian Bardini',
    seoDescription:
      "Kylian Bardini's terminal apps: gwm (git worktree manager), vellum (TUI SQL client, in development) and LazyCurl (TUI HTTP client, archived).",
    ogTitle: 'Apps',
    ogSubtitle: 'gwm, vellum and LazyCurl',
    eyebrow: 'APPS',
    title: 'Tools for the terminal.',
    intro:
      "What I ship, what I'm building and what I've put away. All open source, the code is on GitHub.",
    site: 'Site',
    repo: 'Repository',
    releases: 'Releases',
    install: 'Install',
    demo: 'Demo',
    preview: 'Preview',
    status: {
      released: 'Available',
      inDevelopment: 'In development',
      archived: 'Archived',
    },
    apps: {
      gwm: {
        illustration:
          "gwm's TUI: the repository's worktrees with their branch and state, the selected worktree's details and its latest commits",
        tagline: 'Git worktree manager for the terminal, CLI and TUI.',
        description:
          'gwm creates the worktree, runs the project setup, links the issue and shows which AI agent is working where. A single binary, no git CLI needed.',
        features: [
          'One command to create the worktree, set the project up and link its issue.',
          'Knows which AI agent works where: Claude Code, Codex, opencode and Mistral Vibe.',
          'A machine surface: JSON output, a JSON-RPC daemon and a statusline for your prompt.',
          'gwm undo and gwm history recover a worktree removed by mistake.',
        ],
      },
      vellum: {
        tagline: 'TUI SQL client, with a diff for every write.',
        description:
          'Browse, query and edit a database from the terminal, seeing every write as a GitHub-like diff before it applies. Pre-0.1: not usable yet.',
        features: [
          'Browse, query and edit a database without leaving the terminal.',
          'A GitHub-like diff before every write.',
          'Rust and ratatui: a single binary, no account, no telemetry.',
        ],
      },
      lazycurl: {
        illustration: "LazyCurl's interface: collections, request and response side by side",
        tagline: 'TUI HTTP client, between lazygit and Postman.',
        description: "Test an API from the terminal, with lazygit's interface and Postman's tools.",
        features: [
          'Lazygit-style interface: multiple panels and vim motions.',
          'JavaScript pre- and post-request scripts, and 16 test assertions.',
          'Request collections and environment variables.',
          'cURL, OpenAPI 3 and Postman import and export.',
        ],
      },
    },
  },

  blogNav: {
    tags: 'Tags',
    portfolio: 'Portfolio',
    sponsor: 'Sponsor',
  },

  // Blog Section
  lightbox: {
    open: 'Enlarge the illustration: {name}',
    close: 'Close',
  },

  blog: {
    toc: 'Contents',
    readingProgress: 'Reading progress',
    pagination: 'Pagination',
    read: 'Read',
    title: 'Articles & Thoughts',
    description: 'Writing about web development, architecture, and tools I use.',
    listHeading: 'All articles',
    allTags: 'All',
    noArticles: 'No articles yet. Stay tuned!',
    viewAll: 'View all articles',
    articleCount: 'articles',
    viewList: 'List',
    viewCards: 'Cards',
    viewCompact: 'Compact',
    backToArticles: 'Back to articles',
    readingTime: 'min read',
    shareArticle: 'Share this article',
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    moreArticles: 'More articles',
    // The promo card beside an article
    sidebar: {
      readMore: 'Read more',
      dismiss: 'Dismiss',
      new: 'New',
      gwm: 'A Rust CLI + TUI to manage Git worktrees across all your projects, with per-repo bootstrap.',
    },
    nextPost: {
      eyebrow: 'Up next',
      text: "The next post's spot, still being written.",
    },
  },

  // Error Page
  error: {
    eyebrow: 'ERROR {code}',
    title: 'Page not found.',
    subtitle: 'Looks like this page got lost in the pixels.',
    titleOther: 'Something broke.',
    subtitleOther: 'Something went wrong on my side. Try again in a moment.',
    playTitle: 'The pixels',
    playSubtitle: 'Drag them around, put them back',
    inPlace: 'in place',
    backHome: 'Back to home',
    reset: 'Reset pixels',
  },

  // Footer Section
  footer: {
    heading: 'Site footer',
    nav: {
      articles: 'Articles',
      tags: 'Tags',
    },
    contact: {
      title: 'Get in Touch',
      description: "Have a project in mind? Let's discuss how we can work together.",
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: "your{'@'}email.com",
      message: 'Message',
      messagePlaceholder: 'Tell me about your project...',
      send: 'Send Message',
      sending: 'Sending...',
      success: "Message sent successfully! I'll get back to you soon.",
      error: 'Failed to send message. Please try again or email me directly.',
    },
    links: {
      title: 'Connect',
      other: 'Links',
    },
    navigation: {
      title: 'Navigation',
    },
    location: {
      title: 'Location',
      city: 'Nancy, France',
    },
    availability: {
      title: 'Availability',
      status: 'Open to opportunities',
    },
    email: {
      title: 'Email',
    },
    copyright: 'All rights reserved.',
  },
  // The OG images' facts (components/OgImage)
  og: {
    status: 'Status',
    location: 'Location',
    site: 'Site',
    github: 'GitHub',
    published: 'Published',
    reading: 'Reading',
    tags: 'Tags',
    author: 'Author',
  },
}
