<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

function handleTabKeydown(event: KeyboardEvent) {
  const tabs = skills.value
  const currentIndex = tabs.findIndex(s => s.id === activeTab.value)
  let newIndex = currentIndex

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    newIndex = (currentIndex + 1) % tabs.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    newIndex = (currentIndex - 1 + tabs.length) % tabs.length
  } else if (event.key === 'Home') {
    event.preventDefault()
    newIndex = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    newIndex = tabs.length - 1
  } else {
    return
  }

  activeTab.value = tabs[newIndex].id
  const tabEl = document.getElementById(`tab-${tabs[newIndex].id}`)
  tabEl?.focus()
}

interface Skill {
  id: string
  label: string
  title: string
  description: string
  features: string[]
  code: string
}

const skills = computed<Skill[]>(() => [
  {
    id: 'typescript',
    label: 'TypeScript',
    title: t('skills.items.typescript.title'),
    description: t('skills.items.typescript.description'),
    features: [
      t('skills.items.typescript.features[0]'),
      t('skills.items.typescript.features[1]'),
      t('skills.items.typescript.features[2]'),
      t('skills.items.typescript.features[3]'),
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
    title: t('skills.items.laravel.title'),
    description: t('skills.items.laravel.description'),
    features: [
      t('skills.items.laravel.features[0]'),
      t('skills.items.laravel.features[1]'),
      t('skills.items.laravel.features[2]'),
      t('skills.items.laravel.features[3]'),
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
    title: t('skills.items.nuxt.title'),
    description: t('skills.items.nuxt.description'),
    features: [
      t('skills.items.nuxt.features[0]'),
      t('skills.items.nuxt.features[1]'),
      t('skills.items.nuxt.features[2]'),
      t('skills.items.nuxt.features[3]'),
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
    title: t('skills.items.rust.title'),
    description: t('skills.items.rust.description'),
    features: [
      t('skills.items.rust.features[0]'),
      t('skills.items.rust.features[1]'),
      t('skills.items.rust.features[2]'),
      t('skills.items.rust.features[3]'),
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
    title: t('skills.items.cloud.title'),
    description: t('skills.items.cloud.description'),
    features: [
      t('skills.items.cloud.features[0]'),
      t('skills.items.cloud.features[1]'),
      t('skills.items.cloud.features[2]'),
      t('skills.items.cloud.features[3]'),
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
])

const activeTab = ref<string>('typescript')

// Simple syntax highlighter — Claude Dark theme colors
function highlightCode(code: string, lang: string): string {
  // Escape HTML first
  let html = code
    .replace(/&/g, '\u0001amp;')
    .replace(/</g, '\u0001lt;')
    .replace(/>/g, '\u0001gt;')

  // Strings (before other replacements to protect string content)
  html = html.replace(/("[^"]*"|'[^']*')/g, '\u0002s$1\u0003')

  // Comments (// and #)
  html = html.replace(/(\/\/.*$)/gm, '\u0002c$1\u0003')
  html = html.replace(/^(\s*#[^[{].*$)/gm, '\u0002c$1\u0003')

  if (lang === 'typescript' || lang === 'nuxt') {
    html = html.replace(/\b(type|interface|const|let|var|function|async|await|return|import|export|from|new|class|extends)\b/g, '\u0002k$1\u0003')
    html = html.replace(/\b(string|number|boolean|void|Promise|Record|unknown)\b/g, '\u0002t$1\u0003')
  } else if (lang === 'laravel') {
    html = html.replace(/\b(class|public|function|return|new|extends|use)\b/g, '\u0002k$1\u0003')
    html = html.replace(/\b(JsonResponse|Order|StoreOrderRequest|OrderResource|Controller)\b/g, '\u0002t$1\u0003')
    html = html.replace(/(\$\w+)/g, '\u0002v$1\u0003')
  } else if (lang === 'rust') {
    html = html.replace(/\b(use|fn|let|struct|pub|impl|mod|self|Ok|Err|mut|main)\b/g, '\u0002k$1\u0003')
    html = html.replace(/\b(String|Result|Box|Parser|Cli)\b/g, '\u0002t$1\u0003')
    html = html.replace(/(#\[[^\]]*\])/g, '\u0002a$1\u0003')
  } else if (lang === 'cloud') {
    html = html.replace(/^(\s*[\w-]+):/gm, '\u0002k$1\u0003:')
  }

  // Function calls (word before parenthesis)
  html = html.replace(/\b(\w+)\(/g, '\u0002f$1\u0003(')

  // Now convert markers to actual HTML spans
  html = html
    .replace(/\u0001/g, '&')
    .replace(/\u0002k([\s\S]*?)\u0003/g, '<span class="code-keyword">$1</span>')
    .replace(/\u0002s([\s\S]*?)\u0003/g, '<span class="code-string">$1</span>')
    .replace(/\u0002c([\s\S]*?)\u0003/g, '<span class="code-comment">$1</span>')
    .replace(/\u0002t([\s\S]*?)\u0003/g, '<span class="code-type">$1</span>')
    .replace(/\u0002f([\s\S]*?)\u0003/g, '<span class="code-function">$1</span>')
    .replace(/\u0002v([\s\S]*?)\u0003/g, '<span class="code-variable">$1</span>')
    .replace(/\u0002a([\s\S]*?)\u0003/g, '<span class="code-attribute">$1</span>')

  return html
}
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
          :tabindex="activeTab === skill.id ? 0 : -1"
          :class="cn(
            'relative px-5 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap',
            'transition-colors duration-200 flex-shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            activeTab === skill.id
              ? 'text-primary-500'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
          )"
          @click="activeTab = skill.id"
          @keydown="handleTabKeydown"
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
          enter-active-class="transition-all duration-400 ease-out"
          enter-from-class="opacity-0 translate-y-6"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-6"
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
              <!-- Code content with syntax highlighting -->
              <!-- eslint-disable vue/no-v-html -->
              <pre class="flex-1 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto claude-code" v-html="highlightCode(skill.code, skill.id)" />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UiAnimatedSection>
</template>
