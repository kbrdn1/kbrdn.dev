<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface Skill {
  id: string
  label: string
  title: string
  description: string
  features: string[]
  code: string
}

const skills: Skill[] = [
  {
    id: 'typescript',
    label: 'TypeScript',
    title: 'TypeScript Expert',
    description: 'Strong typing across every layer of the stack. From frontend components to backend APIs, TypeScript keeps the codebase predictable and maintainable at scale.',
    features: [
      '3+ years of daily production use',
      'Advanced generics, mapped types & utility types',
      'Strict mode enforcement on all projects',
      'End-to-end type safety from API to UI',
    ],
    code: `type ApiResponse<T> = {
  data: T
  status: 'ok' | 'error'
  meta: Record<string, unknown>
}

async function fetchUser(
  id: string
): Promise<ApiResponse<User>> {
  const res = await api.get(\`/users/\${id}\`)
  return res.data
}`,
  },
  {
    id: 'laravel',
    label: 'Laravel',
    title: 'Laravel — Backend APIs',
    description: 'Building robust REST APIs and backend services with Laravel. Eloquent ORM, queues, and the full ecosystem for rapid, reliable delivery.',
    features: [
      'RESTful API design with form requests & resources',
      'Eloquent relationships & query optimization',
      'Queue workers, jobs & event broadcasting',
      'Stripe integration, multi-tenancy patterns',
    ],
    code: `class OrderController extends Controller
{
    public function store(
        StoreOrderRequest $request
    ): JsonResponse {
        $order = Order::create(
            $request->validated()
        );

        ProcessPayment::dispatch($order);

        return response()->json(
            new OrderResource($order), 201
        );
    }
}`,
  },
  {
    id: 'nuxt',
    label: 'Nuxt',
    title: 'Nuxt — Vue Meta-Framework',
    description: 'Server-side rendering, static generation, and hybrid modes with Nuxt. The framework behind this very portfolio and several production apps.',
    features: [
      'SSR, SSG & hybrid rendering strategies',
      'File-based routing with middleware & layouts',
      'Nuxt Content for markdown-driven sites',
      'Auto-imports, composables & server routes',
    ],
    code: `// composables/useProject.ts
export function useProject(slug: string) {
  return useAsyncData(
    \`project-\${slug}\`,
    () => queryCollection('projects')
      .where('slug', '=', slug)
      .first()
  )
}

// pages/projects/[slug].vue
const route = useRoute()
const { data } = await useProject(
  route.params.slug as string
)`,
  },
  {
    id: 'rust',
    label: 'Rust',
    title: 'Rust — Systems Programming',
    description: 'Exploring systems-level programming through Rust. Currently learning ownership, lifetimes, and building CLI tools with real-world utility.',
    features: [
      'Ownership model & borrow checker fundamentals',
      'CLI tooling with clap & crossterm',
      'Built LazyCurl — a Go-based TUI HTTP client',
      'Growing interest in WebAssembly targets',
    ],
    code: `use clap::Parser;

#[derive(Parser)]
#[command(about = "HTTP client TUI")]
struct Cli {
    #[arg(short, long)]
    url: String,
    #[arg(short, long, default_value = "GET")]
    method: String,
}

fn main() -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();
    let resp = request(&cli.url, &cli.method)?;
    render_tui(resp)
}`,
  },
  {
    id: 'cloud',
    label: 'Cloud',
    title: 'Cloud & DevOps',
    description: 'Containerized deployments, CI/CD pipelines, and cloud infrastructure. From local Docker Compose to production on AWS and self-hosted VPS.',
    features: [
      'Docker multi-stage builds & Compose orchestration',
      'GitHub Actions CI/CD with deploy webhooks',
      'AWS services — S3, EC2, RDS, CloudFront',
      'Dokploy self-hosted PaaS on VPS',
    ],
    code: `# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build

  deploy:
    needs: build
    steps:
      - run: curl -X POST $WEBHOOK_URL`,
  },
]

const activeTab = ref<string>(skills[0].id)

</script>

<template>
  <UiAnimatedSection animation="fadeInUp">
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="space-y-1">
        <span class="text-[11px] font-mono uppercase tracking-widest text-primary-500">
          {{ t('skills.featured') }}
        </span>
        <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">
          {{ t('skills.title') }}
        </h2>
      </div>

      <!-- Tab Bar -->
      <div
        :class="cn(
          'flex overflow-x-auto scrollbar-hide',
          'border-b border-neutral-200 dark:border-neutral-800',
          '-mb-px'
        )"
        role="tablist"
        :aria-label="t('skills.ariaLabel')"
      >
        <button
          v-for="skill in skills"
          :id="`tab-${skill.id}`"
          :key="skill.id"
          role="tab"
          :aria-selected="activeTab === skill.id"
          :aria-controls="`panel-${skill.id}`"
          :class="cn(
            'relative px-5 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap',
            'transition-colors duration-200 flex-shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            activeTab === skill.id
              ? 'text-primary-500'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
          )"
          @click="activeTab = skill.id"
        >
          {{ skill.label }}
          <!-- Active indicator -->
          <span
            :class="cn(
              'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 transition-all duration-300',
              activeTab === skill.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            )"
          />
        </button>
      </div>

      <!-- Tab Content -->
      <div
        v-for="skill in skills"
        :id="`panel-${skill.id}`"
        :key="skill.id"
        role="tabpanel"
        :aria-labelledby="`tab-${skill.id}`"
        :hidden="activeTab !== skill.id"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-3"
          mode="out-in"
        >
          <div
            v-if="activeTab === skill.id"
            :key="skill.id"
            class="grid md:grid-cols-2 gap-8 py-6 min-h-[320px]"
          >
            <!-- Left: Description & Features -->
            <div class="space-y-5">
              <div class="space-y-2">
                <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  {{ skill.title }}
                </h3>
                <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {{ skill.description }}
                </p>
              </div>

              <ul class="space-y-2.5">
                <li
                  v-for="(feature, index) in skill.features"
                  :key="index"
                  class="group flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <UIcon
                    name="i-heroicons-check-circle"
                    :class="cn(
                      'w-4 h-4 flex-shrink-0 mt-0.5',
                      'text-primary-500 transition-opacity duration-200 group-hover:opacity-80'
                    )"
                  />
                  <span class="leading-snug">{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- Right: Code Block -->
            <div
              :class="cn(
                'bg-neutral-100 dark:bg-neutral-900',
                'border border-neutral-200 dark:border-neutral-800',
                'hover:border-neutral-300 dark:hover:border-neutral-700',
                'p-4 overflow-x-auto',
                'flex flex-col',
                'transition-colors duration-200'
              )"
            >
              <!-- Code block header -->
              <div class="flex items-center gap-1.5 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <span class="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700" />
                <span class="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700" />
                <span class="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700" />
                <span class="ml-3 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {{ skill.label }}
                </span>
              </div>
              <!-- Code content -->
              <pre class="flex-1 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre overflow-x-auto"><code>{{ skill.code }}</code></pre>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UiAnimatedSection>
</template>
