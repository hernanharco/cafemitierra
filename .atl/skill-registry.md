# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When structuring Angular projects or deciding where to place components | angular-architecture | /home/harco/.config/opencode/skills/angular/architecture/SKILL.md |
| When creating Angular components, using signals, or setting up zoneless | angular-core | /home/harco/.config/opencode/skills/angular/core/SKILL.md |
| When working with forms, validation, or form state in Angular | angular-forms | /home/harco/.config/opencode/skills/angular/forms/SKILL.md |
| When optimizing Angular app performance, images, or lazy loading | angular-performance | /home/harco/.config/opencode/skills/angular/performance/SKILL.md |
| When building AI chat features - breaking changes from v4 | ai-sdk-5 | /home/harco/.config/opencode/skills/ai-sdk-5/SKILL.md |
| When creating Astro components, layouts, pages, or integrating visual effects | astro | /home/harco/.config/opencode/skills/astro/SKILL.md |
| When creating a pull request, opening a PR, or preparing changes for review | branch-pr | /home/harco/.config/opencode/skills/branch-pr/SKILL.md |
| When building REST APIs with Django - ViewSets, Serializers, Filters | django-drf | /home/harco/.config/opencode/skills/django-drf/SKILL.md |
| When creating PRs, writing PR descriptions, or using gh CLI for pull requests | github-pr | /home/harco/.config/opencode/skills/github-pr/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage | go-testing | /home/harco/.config/opencode/skills/go-testing/SKILL.md |
| When creating 3D web experiences, Three.js scenes, GSAP ScrollTrigger animations, breakout-frame effects, 3D parallax, scroll-driven 3D, or Japanese-style immersive websites | immersive-3d-web | /home/harco/.config/opencode/skills/immersive-3d-web/SKILL.md |
| When writing E2E tests - Page Objects, selectors, MCP workflow | playwright | /home/harco/.config/opencode/skills/playwright/SKILL.md |
| When writing Python tests - fixtures, mocking, markers | pytest | /home/harco/.config/opencode/skills/pytest/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | /home/harco/.config/opencode/skills/issue-creation/SKILL.md |
| When user asks to create an epic, large feature, or multi-task initiative | jira-epic | /home/harco/.config/opencode/skills/jira-epic/SKILL.md |
| When user asks to create a Jira task, ticket, or issue | jira-task | /home/harco/.config/opencode/skills/jira-task/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | judgment-day | /home/harco/.config/opencode/skills/judgment-day/SKILL.md |
| When working with Next.js - routing, Server Actions, data fetching | nextjs-15 | /home/harco/.config/opencode/skills/nextjs-15/SKILL.md |
| When writing React components - no useMemo/useCallback needed | react-19 | /home/harco/.config/opencode/skills/react-19/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator | /home/harco/.config/opencode/skills/skill-creator/SKILL.md |
| When styling with Tailwind - cn(), theme variables, no var() in className | tailwind-4 | /home/harco/.config/opencode/skills/tailwind-4/SKILL.md |
| When writing TypeScript code - types, interfaces, generics | typescript | /home/harco/.config/opencode/skills/typescript/SKILL.md |
| When using Zod for validation - breaking changes from v3 | zod-4 | /home/harco/.config/opencode/skills/zod-4/SKILL.md |
| When managing React state with Zustand | zustand-5 | /home/harco/.config/opencode/skills/zustand-5/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### angular-architecture
- Follow the Scope Rule: each module/feature owns its files in its own folder
- Project structure: `src/app/{feature}/` contains components, services, pipes, directives
- File naming: `{feature}.{type}.ts` (e.g., `user.component.ts`, `user.service.ts`)
- Barrel exports via `index.ts` per feature folder

### angular-core
- Standalone components ONLY — no NgModules needed
- Use `inject()` instead of constructor injection
- Use signals (`signal()`, `computed()`, `effect()`) instead of zone.js change detection
- Prefer `@if`/`@for`/`@switch` control flow over `*ngIf`/`*ngFor`/`*ngSwitch`
- Zoneless: configure `provideZoneChangeDetection({ eventCoalescing: true })` or no zone at all

### angular-forms
- Signal Forms (experimental): `const name = signal('')`, bind with `[formControl]="name"`
- Reactive Forms for complex validation: `FormGroup`, `FormControl`, `Validators`
- Typed forms: `new FormGroup<LoginForm>({...})` since Angular 14
- Use `form.controls.email.value` instead of `form.get('email')?.value`

### angular-performance
- Always use `NgOptimizedImage` directive: `<img ngSrc="photo.jpg" width="400" height="300">`
- Use `@defer` blocks for lazy-loading heavy components: `@defer (on viewport) { <heavy-component /> }`
- Lazy load feature modules with `loadComponent` or `loadChildren`
- SSR/SSG: `provideClientHydration()` for Angular Universal, `ng serve --ssr`

### ai-sdk-5
- Breaking: `useChat` moved from `ai` to `@ai-sdk/react`
- Breaking: use `DefaultChatTransport({ api })` instead of passing `api` directly
- Breaking: `message.content` replaced by `message.parts` (array of MessagePart)
- Text extraction: filter `parts` by `type === "text"` and map to strings
- Server: use `streamText()` and `result.toDataStreamResponse()` in route handlers

### astro
- Zero JS by default — effects are progressive enhancement layers
- Hydration directives: `client:visible` (effects), `client:idle` (non-critical), NEVER `client:load` for decorative effects
- Three.js/GSAP always wrapped in client islands, never imported in layouts/pages
- Lenis + GSAP: connect via `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(time => lenis.raf(time * 1000))`
- SSG by default, SSR only for dynamic data, hybrid with `export const prerender = false`
- Structure: `effects/` (client JS), `ui/` (zero JS), `sections/` (composition)

### branch-pr
- EVERY PR MUST link an approved issue with `status:approved` label
- Branch name: `type/description` (lowercase, `a-z0-9._-`)
- Conventional commits: `type(scope): description`
- PR body: Closes #N, PR type checkbox, Summary, Changes table, Test plan, Contributor checklist
- Automated checks must pass: issue referenced, issue approved, type:* label present

### django-drf
- ModelViewSet for CRUD endpoints, override `get_serializer_class()` per action
- Read/Write serializers: separate serializer per action (create vs update vs read)
- FilterSets with `django_filters` for query params filtering
- Permissions: extend `BasePermission` for custom logic
- DefaultRouter for URL registration, split multi-component work into separate tasks

### github-pr
- PR title = conventional commit: `type(scope): short description`
- PR body: Summary (1-3 bullets), Changes list, Testing checklist
- Use `gh pr create` with `--title` and `--body` flags
- Atomic commits: one thing per commit, never giant commits
- Draft PRs with `--draft` for work in progress

### go-testing
- Table-driven tests: slice of test structs with `name`, `input`, `expected`, `wantErr`
- Bubbletea: test `Model.Update()` directly with `tea.KeyMsg`, use `teatest.NewTestModel()` for integration
- Golden files: compare output against `testdata/*.golden`, update with `-update` flag
- Mock os/exec via interfaces, use `t.TempDir()` for temp files
- File organization: `model_test.go`, `update_test.go`, `view_test.go` beside source files

### immersive-3d-web
- Stack: Three.js + GSAP + Lenis — the "Gentleman 3D" stack
- Lenis FIRST: smooth scroll must be set up before any scroll-driven effects
- GSAP with `scrub: 1` for buttery scroll-driven animations
- Breakout frame: `position: fixed; pointer-events: none` on canvas + objects at varying Z depths
- Performance: cap `pixelRatio` to 2, ALWAYS dispose on unmount, merge geometries, reduce draw calls
- With Astro: wrap in `client:visible` island, never in layout

### issue-creation
- Blank issues disabled — MUST use bug report or feature request template
- Every issue auto-gets `status:needs-review` label
- Maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, not issues
- Search duplicates before creating

### jira-epic
- Title: `[EPIC] Feature Name`
- Required sections: Feature Overview, Requirements (by functional area), Technical Considerations (performance/data/UI), Implementation Checklist
- Include Mermaid diagrams (architecture, data flow, state, ER)
- Split into child tasks using `jira-task` skill with `[FEATURE]` prefix
- Jira MCP: `issue_type: "Epic"`, use `customfield_10363` for description in Jira Wiki markup

### jira-task
- Multi-component work = separate tasks per component (API, UI, SDK)
- Title format: `[TYPE] description (component)` — TYPE: BUG, FEATURE, ENHANCEMENT, REFACTOR, DOCS, CHORE
- Bugs: sibling tasks per component. Features: parent task (user-facing) + child tasks (technical)
- Parent task has user story, no technical details. Child tasks have file paths, technical AC
- Jira MCP: use `customfield_10363` for description in Wiki markup, `customfield_10359` for team

### judgment-day
- Launch TWO blind judge sub-agents in PARALLEL via `delegate` — never sequential
- Orchestrator NEVER reviews code — only coordinates judges and synthesizes verdicts
- Fix Agent is a separate delegation — never use a judge as fixer
- Convergence: Round 1 with user confirmation, Round 2+ for critical-only re-judge
- After 2 fix iterations, ASK user before continuing. Never auto-escalate.
- Theoretical warnings are reported as INFO, not fixed, not re-judged

### nextjs-15
- App Router: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` conventions
- Server Components by default — add `"use client"` only for interactivity/hooks
- Server Actions: `"use server"` at top of file, use `revalidatePath` and `redirect`
- Data fetching: parallel with `Promise.all`, streaming with `Suspense` boundaries
- Route handlers: `NextRequest` + `NextResponse.json()` in `app/api/route.ts`

### playwright
- MCP workflow: navigate → snapshot → interact → screenshot → verify → document selectors BEFORE writing tests
- Selectors priority: `getByRole` > `getByLabel` > `getByText` > `getByTestId` (last resort)
- Page Object Model: `BasePage` with shared methods, specific pages extend it
- Reuse existing page objects — never duplicate functionality
- File structure: `{page-name}-page.ts`, `{page-name}.spec.ts` (ALL tests in one file), `{page-name}.md`
- Tags: `@critical`, `@e2e`, `@feature`, `@TEST-ID-001`

### pytest
- Fixtures for test setup/teardown, `conftest.py` for shared fixtures
- Use `unittest.mock.patch` for mocking, `MagicMock` for complex objects
- `@pytest.mark.parametrize` for multiple input/output combinations
- Custom markers in `pyproject.toml` for test categorization
- Async tests with `@pytest.mark.asyncio`
- Skip with `@pytest.mark.skip` or `@pytest.mark.skipif`

### react-19
- NO `useMemo`/`useCallback` — React Compiler handles memoization
- Named imports from `"react"`, never `import React from "react"`
- Server Components by default, `"use client"` only for interactivity/hooks
- `use()` hook for promises and context (supports conditional rendering unlike `useContext`)
- `useActionState` for form actions with pending state
- `ref` is a regular prop — no `forwardRef` needed

### skill-creator
- Structure: `skills/{name}/SKILL.md` with frontmatter (name, description/Trigger, license, metadata)
- Description MUST include "Trigger:" keyword for auto-detection
- Include: When to Use, Critical Patterns, Code Examples (minimal), Commands, Resources
- Do NOT add Keywords section, duplicate docs, or troubleshooting
- After creation, register in AGENTS.md via `skill-registry` skill

### tailwind-4
- NEVER use `var()` in className — use Tailwind semantic classes instead
- NEVER use hex colors in className — use palette classes (`text-white`, `bg-slate-800`)
- Use `cn()` for conditional classes and merging, NOT for static classes
- Dynamic values → `style` prop (e.g., `width: ${x}%`), not arbitrary values
- Library props that can't use className → use constants with `var()` as escape hatch

### typescript
- Const types pattern: create `as const` object first, then `(typeof X)[keyof typeof X]`
- Flat interfaces: one level depth, reference dedicated interfaces for nested objects
- NEVER use `any` — use `unknown` with type guards, or generics
- Prefer utility types: `Pick`, `Omit`, `Partial`, `Required`, `Record`, `ReturnType`
- `import type` for type-only imports to avoid bundling runtime code

### zod-4
- Breaking from v3: top-level validators (`z.email()` instead of `z.string().email()`)
- Breaking: `.min(1)` instead of `.nonempty()`, `{ error: "msg" }` instead of `{ message: "msg" }`
- Object schema: `z.object({ ... })`, type inference via `z.infer<typeof schema>`
- Safe parsing with `safeParse()` returns `{ success, data/error }`
- Discriminated unions with `z.discriminatedUnion("status", [...])` for tagged unions

### zustand-5
- `create<T>()((set) => ({...}))` for store creation with TypeScript inference
- Selectors to prevent re-renders: `useStore((state) => state.field)` — NEVER select entire store
- `useShallow` for selecting multiple fields without unnecessary re-renders
- Async actions: set loading/error states inside the action function
- Slices pattern for large stores: split into separate creator functions, compose in root store
- `persist` middleware for localStorage, `immer` for mutable syntax, `devtools` for Redux DevTools

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | frontend/AGENTS.md | Astro dev with `--background` flag |
| CLAUDE.md | frontend/CLAUDE.md | Same content as AGENTS.md |
