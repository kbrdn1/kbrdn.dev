# Tasks: Automated Deployment Pipeline

**Input**: Design documents from `/specs/1-dokploy-deployment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Not requested in feature specification. Manual validation via quickstart.md verification checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bug fixes and project verification before deployment work

- [x] T001 Fix content collection path bug in content.config.ts (change `blog/` to `blogs/` on line 35)
- [x] T002 [P] Verify all 6 content collections have content files in app/content/
- [x] T003 [P] Create .github/workflows/ directory structure

**Checkpoint**: Content collections working, GitHub workflows directory ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Docker infrastructure that MUST be complete before deployment stories

**⚠️ CRITICAL**: US2 (Developer Deployment) and US3 (Visitor Experience) cannot proceed without this phase

- [x] T004 Create Dockerfile with multi-stage build (deps → builder → runner) at repository root
- [x] T005 [P] Create .dockerignore with exclusions for node_modules, .nuxt, .output, .git, docs/
- [x] T006 [P] Create docker-compose.yml for local development testing at repository root
- [x] T007 Test Docker build locally with `docker build -t kbrdn-dev .`
- [x] T008 Test Docker run locally with `docker run -p 3000:3000 kbrdn-dev`

**Checkpoint**: Docker builds and runs successfully locally. Foundation ready for deployment stories.

---

## Phase 3: User Story 1 - Content Editor Publishing (Priority: P1) 🎯 MVP

**Goal**: Enable content editors to publish via Nuxt Studio with automatic deployment

**Independent Test**: Create a blog post in Nuxt Studio → verify it appears on live site within 5 minutes

### Implementation for User Story 1

- [x] T009 [US1] Update nuxt.config.ts with Studio configuration (content.studio.enabled, gitInfo)
- [x] T010 [US1] Add runtimeConfig for studioToken in nuxt.config.ts
- [x] T011 [US1] Create .studio/ directory at repository root
- [x] T012 [US1] Create .studio/config.json with collection definitions (blog, projects, experiences, skills, stacks)
- [x] T013 [US1] Create .github/workflows/studio-sync.yml for content change detection
- [x] T014 [P] [US1] Create app/components/content/Alert.vue MDC component
- [x] T015 [P] [US1] Create app/components/content/Callout.vue MDC component
- [x] T016 [P] [US1] Create app/components/content/CodeGroup.vue MDC component

**Checkpoint**: Nuxt Studio integration complete. Content sync workflow ready. User Story 1 independently testable.

---

## Phase 4: User Story 2 - Developer Code Deployment (Priority: P2)

**Goal**: Automatic deployment on push to master with build validation

**Independent Test**: Push a minor code change → verify deployment within 10 minutes after CI passes

### Implementation for User Story 2

- [x] T017 [US2] Create .github/workflows/deploy.yml with build job (checkout, Bun setup, install, build)
- [x] T018 [US2] Add deploy job to deploy.yml with Dokploy webhook trigger
- [x] T019 [US2] Add caching configuration to deploy.yml for Bun dependencies
- [x] T020 [US2] Add workflow_dispatch trigger to deploy.yml for manual deployments
- [x] T021 [US2] Add error handling and notifications to deploy.yml
- [x] T022 [US2] Document required GitHub secrets in README or DEPLOYMENT.md

**Checkpoint**: CI/CD pipeline complete. Push-to-deploy workflow functional. User Story 2 independently testable.

---

## Phase 5: User Story 3 - Site Visitor Experience (Priority: P3)

**Goal**: Fast page loads, valid SSL, reliable uptime

**Independent Test**: Access site from various locations → verify SSL, < 3s load time, uptime monitoring

### Implementation for User Story 3

- [x] T023 [US3] Add HEALTHCHECK instruction to Dockerfile with wget spider check
- [x] T024 [US3] Configure health check timing (interval=30s, timeout=10s, retries=3, start_period=40s)
- [x] T025 [US3] Add production environment variables to docker-compose.yml for local testing
- [x] T026 [US3] Document DNS configuration requirements (A records for @ and www to 72.60.212.44)
- [x] T027 [US3] Document Dokploy SSL configuration steps in quickstart.md or README

**Checkpoint**: Health checks configured. SSL/DNS documentation complete. User Story 3 independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates

- [x] T028 [P] Run complete quickstart.md verification checklist
- [x] T029 [P] Verify all success criteria from spec.md can be measured
- [x] T030 Update CLAUDE.md with deployment-related context if needed
- [x] T031 Create initial deployment commit and push to master

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 (content bug fix) - BLOCKS US2, US3
- **User Story 1 (Phase 3)**: Depends on T001-T003 - independent of Docker
- **User Story 2 (Phase 4)**: Depends on T004-T008 (Docker foundation)
- **User Story 3 (Phase 5)**: Depends on T004-T008 (Docker foundation)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Run In Parallel With |
|-------|------------|--------------------------|
| US1 (P1) | Setup (T001-T003) | US2, US3 after Foundational |
| US2 (P2) | Foundational (T004-T008) | US1, US3 |
| US3 (P3) | Foundational (T004-T008) | US1, US2 |

### Within Each User Story

- Tasks without [P] marker must be sequential
- Tasks with [P] marker can run in parallel
- Complete all tasks in a phase before checkpoint validation

### Parallel Opportunities

**Phase 1 (parallel set):**
- T002, T003 can run together after T001

**Phase 2 (parallel set):**
- T005, T006 can run together while T004 is in progress

**Phase 3 - US1 (parallel set):**
- T014, T015, T016 (MDC components) can all run in parallel

**Cross-Phase Parallelism:**
- After Foundational (Phase 2), US1 tasks and US2 tasks can run in parallel
- After Foundational (Phase 2), US2 and US3 can run in parallel

---

## Parallel Execution Examples

### Example 1: Phase 2 Parallel Execution
```bash
# Launch in parallel:
Task: "Create .dockerignore with exclusions" (T005)
Task: "Create docker-compose.yml for local dev" (T006)

# Then sequential:
Task: "Test Docker build locally" (T007)
Task: "Test Docker run locally" (T008)
```

### Example 2: User Story 1 MDC Components
```bash
# Launch all MDC components together:
Task: "Create Alert.vue MDC component" (T014)
Task: "Create Callout.vue MDC component" (T015)
Task: "Create CodeGroup.vue MDC component" (T016)
```

### Example 3: Cross-Story Parallelism
```bash
# After Foundational complete, launch in parallel:
Task: "Create deploy.yml workflow" (T017) - US2
Task: "Update nuxt.config.ts with Studio config" (T009) - US1
Task: "Add HEALTHCHECK to Dockerfile" (T023) - US3
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 3: User Story 1 (T009-T016)
3. **STOP and VALIDATE**: Test Nuxt Studio content publishing independently
4. Deliver/demo if ready

### Incremental Delivery (Recommended)

1. **Setup + US1** → Content editing via Nuxt Studio works → Demo
2. **Foundational + US2** → Push-to-deploy pipeline works → Demo
3. **US3** → Health checks, SSL, performance validated → Demo
4. **Polish** → Documentation complete, all criteria verified → Release

### Full Parallel Execution

With multiple developers:
1. Developer A: Setup → US1 (content/Studio)
2. Developer B: Foundational → US2 (CI/CD)
3. Developer C: Foundational (assist) → US3 (infrastructure)

---

## VPS Configuration Tasks (External - Not in Repo)

These tasks must be performed on the VPS and are documented in quickstart.md:

1. SSH into VPS at 72.60.212.44
2. Install Dokploy via `curl -sSL https://dokploy.com/install.sh | sh`
3. Create application "kbrdn-dev" in Dokploy dashboard
4. Configure environment variables in Dokploy
5. Generate and copy webhook URL
6. Configure domain and enable SSL
7. Add webhook URL to GitHub secrets as `DOKPLOY_WEBHOOK_URL`

---

## GitHub Secrets Required (External Configuration)

| Secret | Purpose | When Needed |
|--------|---------|-------------|
| `DOKPLOY_WEBHOOK_URL` | Trigger Dokploy deployment | Before T018 |
| `GH_TOKEN` | GitHub API (contributions chart) | Before first build |
| `RESEND_API_KEY` | Contact form emails | Before first build |
| `NUXT_STUDIO_TOKEN` | Studio API authentication | Before T013 |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual validation replaces automated tests (per spec.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
