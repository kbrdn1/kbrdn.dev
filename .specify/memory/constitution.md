<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0
  Bump rationale: Initial constitution adoption (MAJOR)

  Modified principles: N/A (new file)
  Added sections:
    - I. Branch Convention
    - II. Commit Convention
    - III. Quality Gates
    - IV. Issue & PR Management
    - V. Code Style
    - Development Workflow
    - GitHub Labels
    - Governance

  Removed sections: N/A

  Templates updated:
    - ✅ .specify/templates/plan-template.md (branch pattern updated)
    - ✅ .specify/templates/spec-template.md (branch pattern updated, issue reference added)
    - ✅ .specify/templates/tasks-template.md (branch pattern updated)

  Scripts updated:
    - ✅ .specify/scripts/bash/common.sh (branch pattern updated to <type>/#<issue>-<desc>)
    - ✅ .specify/scripts/bash/create-new-feature.sh (complete rewrite for new convention)

  Deferred items: None
-->

# kbrdn.dev Constitution

## Core Principles

### I. Branch Convention

All feature work MUST follow the branch naming convention:

```
<type>/#<issue-number>-<short-description>
```

**Supported types:**
- `feat` - New feature
- `fix` - Bug fix
- `hotfix` - Critical fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `chore` - Maintenance tasks

**Examples:**
- `feat/#12-github-chart`
- `fix/#45-hydration-error`
- `docs/#23-update-readme`

**Main Branches:**
- `main` - Production branch (protected)
- `dev` - Development branch (default for PRs)

### II. Commit Convention

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/) with emoji prefixes:

```
<emoji> <type>(scope): <description>
```

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 🔥 | `hotfix` | Critical fix |
| ♻️ | `refactor` | Code refactoring |
| 📝 | `docs` | Documentation |
| 🎨 | `style` | Code style/formatting |
| ✅ | `test` | Tests |
| ⬆️ | `chore` | Dependencies/maintenance |
| 🚀 | `perf` | Performance improvement |
| 🔧 | `config` | Configuration changes |

**Examples:**
- `✨ feat(home): add GitHub contributions chart`
- `🐛 fix(i18n): fix French translation for contact`
- `♻️ refactor(ui): simplify theme toggle logic`

### III. Quality Gates

Before submitting any code:

- [ ] Code follows project conventions
- [ ] Linting passes (`make lint`)
- [ ] TypeScript compiles (`make typecheck`)
- [ ] Documentation updated if needed
- [ ] Tested locally

### IV. Issue & PR Management

**Issue Labels** MUST be used consistently:

**Type Labels:**
| Name | Color | Description |
|------|-------|-------------|
| `setup` | #0052CC | Initial configuration |
| `feature` | #0E8A16 | New feature |
| `fix` | #D73A4A | Bug fix |
| `hotfix` | #FF3333 | Critical bug fix |
| `docs` | #0075CA | Documentation |
| `refactor` | #FBCA04 | Code refactoring |
| `chore` | #808080 | Maintenance tasks |

**Domain Labels:**
| Name | Color | Description |
|------|-------|-------------|
| `frontend` | #1D76DB | Frontend code |
| `content` | #7057FF | Content/Markdown |
| `i18n` | #5319E7 | Internationalization |
| `ui` | #0E8A16 | UI components |
| `seo` | #006B75 | SEO optimization |

**Priority Labels:**
| Name | Color | Description |
|------|-------|-------------|
| 🔴 `critical` | #FF0000 | Blocking issue |
| 🟡 `important` | #FFA500 | High priority |
| 🟢 `optional` | #00FF00 | Optional |

**Pull Request Requirements:**
1. Title MUST follow commit convention format
2. Description MUST use the PR template
3. MUST reference related issue with `Fixes #123`
4. Requires at least one approval
5. CI checks MUST pass
6. No merge conflicts

### V. Code Style

**Technology Stack:**
- **Nuxt 4** with Vue 3 Composition API
- **Nuxt UI** for components
- **Nuxt Content** for markdown-based content
- **i18n** for internationalization (EN/FR)
- **Bun** as package manager

**Directory Structure:**
```
app/
├── components/     # Vue components
│   ├── home/       # Homepage sections
│   ├── layout/     # Header, Footer, Background
│   └── ui/         # Reusable UI components
├── composables/    # Vue composables
├── content/        # Markdown content
├── layouts/        # Page layouts
├── pages/          # File-based routing
└── utils/          # Utility functions
```

## Development Workflow

### Starting New Work

1. Create feature branch: `<type>/#<issue-number>-<short-description>`
2. Install dependencies: `make install` or `bun install`
3. Run development server: `make dev` or `bun run dev`

### Useful Commands

```bash
make help       # Show all commands
make dev        # Start development server
make build      # Build for production
make lint       # Run linter
make typecheck  # Type checking
make clean      # Clean build artifacts
```

## Governance

This constitution supersedes all other practices. Amendments require:

1. Documentation of proposed change
2. Approval from project maintainer
3. Migration plan if breaking changes

All PRs and code reviews MUST verify compliance with this constitution.

Use CLAUDE.md for runtime development guidance and architectural decisions.

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
