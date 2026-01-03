.PHONY: help install dev build preview generate clean typecheck lint fmt

help: ## Show this help
	@echo "kbrdn.dev - Makefile"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install all dependencies
	bun install

# ============================================
# Development
# ============================================

dev: ## Start development server (port 3000)
	@echo "Starting development server..."
	bun run dev

# ============================================
# Build
# ============================================

build: ## Build for production
	@echo "Building for production..."
	bun run build

preview: ## Preview production build locally
	@echo "Starting preview server..."
	bun run preview

generate: ## Generate static site
	@echo "Generating static site..."
	bun run generate

# ============================================
# Quality
# ============================================

clean: ## Clean build artifacts and cache
	@echo "Cleaning build artifacts..."
	rm -rf .nuxt .output node_modules/.cache node_modules/.vite
	@echo "Done!"

typecheck: ## Run TypeScript type checking
	@echo "Running type check..."
	bun run typecheck

lint: ## Run ESLint
	@echo "Running linter..."
	bunx eslint .

fmt: ## Format code with ESLint --fix
	@echo "Formatting code..."
	bunx eslint . --fix

# ============================================
# Git Helpers
# ============================================

status: ## Show git status
	git status

push: ## Push to origin
	git push origin HEAD

pull: ## Pull from origin
	git pull origin HEAD

# ============================================
# GitHub Labels
# ============================================

labels: ## Create GitHub labels (requires gh CLI)
	@echo "Creating GitHub labels..."
	@# Type labels
	gh label create "setup" --color "0052CC" --description "Initial configuration" --force
	gh label create "feature" --color "0E8A16" --description "New feature" --force
	gh label create "fix" --color "D73A4A" --description "Bug fix" --force
	gh label create "hotfix" --color "FF3333" --description "Critical bug fix" --force
	gh label create "docs" --color "0075CA" --description "Documentation" --force
	gh label create "refactor" --color "FBCA04" --description "Code refactoring" --force
	gh label create "chore" --color "808080" --description "Maintenance tasks" --force
	@# Domain labels
	gh label create "frontend" --color "1D76DB" --description "Frontend code" --force
	gh label create "content" --color "7057FF" --description "Content/Markdown" --force
	gh label create "i18n" --color "5319E7" --description "Internationalization" --force
	gh label create "ui" --color "0E8A16" --description "UI components" --force
	gh label create "seo" --color "006B75" --description "SEO optimization" --force
	@# Priority labels
	gh label create "critical" --color "FF0000" --description "🔴 Blocking issue" --force
	gh label create "important" --color "FFA500" --description "🟡 High priority" --force
	gh label create "optional" --color "00FF00" --description "🟢 Optional" --force
	@echo "Labels created!"
