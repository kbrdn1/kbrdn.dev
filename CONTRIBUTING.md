# Contributing to kbrdn.dev

Thanks for your interest in contributing to kbrdn.dev! Please take a moment to review this document before submitting your first pull request.

## Table of Contents

- [About this repository](#about-this-repository)
- [Structure](#structure)
- [Development](#development)
- [Commit Convention](#commit-convention)
- [Branch Convention](#branch-convention)
- [GitHub Issue Management](#github-issue-management)
- [Pull Request Process](#pull-request-process)

## About this repository

This is a personal portfolio and blog built with Nuxt 4. It features:
- **Nuxt 4** with Vue 3 Composition API
- **Nuxt UI** for components
- **Nuxt Content** for markdown-based content
- **i18n** for internationalization (EN/FR)

## Structure

```
kbrdn.dev/
├── app/
│   ├── components/     # Vue components
│   │   ├── home/       # Homepage sections
│   │   ├── layout/     # Header, Footer, Background
│   │   └── ui/         # Reusable UI components
│   ├── composables/    # Vue composables
│   ├── content/        # Markdown content
│   ├── layouts/        # Page layouts
│   ├── pages/          # File-based routing
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── i18n/               # Internationalization files
├── public/             # Static assets
├── server/             # Server middleware
└── .github/            # GitHub templates
```

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/YOUR_USERNAME/kbrdn.dev.git
cd kbrdn.dev
```

### Create a new branch

```bash
git checkout -b feat/#1-my-new-feature
```

### Install dependencies

```bash
make install
# or
bun install
```

### Run the project

```bash
make dev
# or
bun run dev
```

### Useful commands

```bash
make help       # Show all commands
make dev        # Start development server
make build      # Build for production
make lint       # Run linter
make typecheck  # Type checking
make clean      # Clean build artifacts
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) with emoji prefixes:

### Format

```
<emoji> <type>(scope): <description>
```

### Types

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

### Examples

```
✨ feat(home): add GitHub contributions chart
🐛 fix(i18n): fix French translation for contact
♻️ refactor(ui): simplify theme toggle logic
📝 docs: update installation instructions
⬆️ chore(deps): upgrade nuxt to 4.x
```

## Branch Convention

### Format

```
<type>/#<issue-number>-<short-description>
```

### Examples

```
feat/#12-github-chart
fix/#45-hydration-error
docs/#23-update-readme
```

### Main Branches

- `main` - Production branch (protected)
- `dev` - Development branch (default for PRs)

## GitHub Issue Management

### Labels

#### Type Labels

| Name | Color | Description |
|------|-------|-------------|
| `setup` | #0052CC | Initial configuration |
| `feature` | #0E8A16 | New feature |
| `fix` | #D73A4A | Bug fix |
| `hotfix` | #FF3333 | Critical bug fix |
| `docs` | #0075CA | Documentation |
| `refactor` | #FBCA04 | Code refactoring |
| `chore` | #808080 | Maintenance tasks |

#### Domain Labels

| Name | Color | Description |
|------|-------|-------------|
| `frontend` | #1D76DB | Frontend code |
| `content` | #7057FF | Content/Markdown |
| `i18n` | #5319E7 | Internationalization |
| `ui` | #0E8A16 | UI components |
| `seo` | #006B75 | SEO optimization |

#### Priority Labels

| Name | Color | Description |
|------|-------|-------------|
| 🔴 `critical` | #FF0000 | Blocking issue |
| 🟡 `important` | #FFA500 | High priority |
| 🟢 `optional` | #00FF00 | Optional |

## Pull Request Process

### Before Submitting

- [ ] Code follows project conventions
- [ ] Linting passes (`make lint`)
- [ ] TypeScript compiles (`make typecheck`)
- [ ] Documentation updated if needed
- [ ] Tested locally

### PR Requirements

1. **Title**: Follow commit convention format
2. **Description**: Use the PR template
3. **Link Issue**: Reference related issue with `Fixes #123`
4. **Self-Review**: Review your own changes first

### Code Review

1. All PRs require at least one approval
2. CI checks must pass
3. No merge conflicts

---

<p align="center">
  <strong>Thank you for contributing! 🙏</strong>
</p>
