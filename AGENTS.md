# AGENTS.md - r3-chat Contributor Guide

This file is for coding agents working in `r3-chat`.
Follow these repo-specific rules before making changes.

## 1) Project Snapshot

- Stack: React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Zustand + Axios + Socket.IO client.
- Language in UI/messages is mostly Spanish. Keep existing copy language unless requested otherwise.
- Routing uses `react-router-dom` (see `src/components/routing/AppRouter.tsx`).
- State uses Zustand stores in `src/stores/*`.
- API access is centralized in `src/services/api.ts`.
- Real-time chat uses `src/services/socketService.ts` (Socket.IO). There is also `src/services/websocketService.ts` (native WS, currently not primary in store wiring).
- Markdown rendering is customized in `src/components/ui/MarkdownRenderer.tsx` and `src/components/ui/CodeBlock.tsx`.

## 2) Commands (Build / Lint / Test)

Run commands from repo root: `D:\WORKSPACES\NESTJS\chat\r3-chat`.

### Install

- `npm install`

### Dev

- `npm run dev` - start Vite dev server.
- `npm run preview` - preview production build.

### Build / Typecheck

- `npm run build` - runs `tsc -b && vite build`.
- `npx tsc -b` - type-check project references only.

### Lint

- `npm run lint` - lint all files.
- `npx eslint src/components/chat/ChatInput.tsx` - lint one file.
- `npx eslint "src/**/*.{ts,tsx}"` - lint TS/TSX scope.

### Tests (current state + single test guidance)

- There is currently **no test runner configured** in `package.json` (`test` script is missing).
- No `*.test.*` / `*.spec.*` files were found in `src/`.
- If you add Vitest, recommended scripts are:
  - `"test": "vitest"`
  - `"test:watch": "vitest --watch"`
  - `"test:run": "vitest run"`
- Single test examples (after Vitest setup):
  - `npx vitest run src/components/ui/MarkdownRenderer.test.tsx`
  - `npx vitest run src/components/ui/MarkdownRenderer.test.tsx -t "renders code block"`

## 3) Required Pre-PR Checks

Before finishing a substantial change:

1. `npm run lint`
2. `npm run build`
3. If tests exist, run targeted tests first, then full suite.

If you cannot run a check, explicitly say what was not run and why.

## 4) Repository Rules Discovery

- `.cursor/rules/`: not found.
- `.cursorrules`: not found.
- `.github/copilot-instructions.md`: not found.

If any of these files are added later, treat them as higher-priority local instructions and update this document.

## 5) Code Organization Conventions

- Keep feature code near existing domains:
  - UI: `src/components/...`
  - Hooks: `src/hooks/...`
  - Stores: `src/stores/...`
  - Services/API: `src/services/...`
  - Shared types: `src/types/index.ts`
  - Constants/helpers/utils: `src/constants`, `src/helpers`, `src/utils`
- Prefer extending existing store/service modules over creating duplicate pathways.
- Re-export patterns exist with `index.ts` files; keep exports tidy and avoid circular imports.

## 6) Style Guide (TS/React)

### Imports

- Order imports as: external libs -> internal absolute/relative modules -> types-only imports.
- Use `import type { ... }` for type-only imports.
- Keep imports minimal; remove unused imports immediately.

### Formatting

- ESLint is configured (`eslint.config.js`), Prettier is not configured.
- Existing files have mixed formatting (2-space vs 4-space, semicolon usage).
- **Rule:** preserve the local style of each edited file; do not reformat unrelated lines.
- Keep lines readable; avoid deeply nested inline expressions when a named variable is clearer.

### Types

- TypeScript strict mode is enabled (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Avoid `any`; if unavoidable, keep it narrowly scoped and add a short reason.
- Reuse existing domain types from `src/types/index.ts` whenever possible.
- Prefer explicit return types on exported functions in services/stores when non-trivial.

### Naming

- Components: `PascalCase` file and symbol names (`ChatInput.tsx`).
- Hooks: `useXxx` (`useChat.ts`, `useModels.ts`).
- Stores: `xxxStore.ts` and exported hook `useXStore`.
- Utilities/helpers/constants: `camelCase` functions, `UPPER_SNAKE_CASE` constants.
- Keep naming in English for code identifiers; UI copy may remain Spanish.

### React Patterns

- Use functional components and hooks only.
- Keep side effects in `useEffect`; keep render paths pure.
- Memoize callbacks (`useCallback`) when passing to deep child trees or store-driven UIs.
- Prefer controlled inputs in forms (`value` + `onChange`).

### Zustand Patterns

- Keep async operations in store actions (as currently done).
- Set loading/error state predictably at action boundaries.
- Use immutable updates; do not mutate state arrays/objects in place.

## 7) Error Handling and Logging

- Use `try/catch` around network and socket boundaries.
- Surface user-safe messages in state/UI; keep raw errors for console diagnostics.
- Preserve backend `error.response?.data?.message` when available.
- Do not swallow errors silently unless intentionally best-effort; in those cases, document via concise comment.

## 8) Security and Data Handling

- Follow `SECURITY.md` guidance.
- Keep auth token handling cookie/memory-based; avoid introducing localStorage token persistence.
- Do not log secrets, tokens, cookies, API keys, or sensitive payloads.
- Sanitize or constrain any new raw HTML/Markdown pathways.
- Keep `withCredentials: true` behavior intact unless backend contract changes.

## 9) Markdown and Chat UX Notes

- Preserve custom markdown behaviors (`<think>`, boxed math, plaintext handling, Mermaid fallback).
- When changing markdown rendering, validate:
  - inline code
  - fenced code with language
  - long plaintext blocks
  - math and tables
- Keep streaming UX responsive: user message first, assistant stream placeholder next.

## 10) Performance and Frontend Quality (Skills-Aligned)

This repo includes skills in `skills-lock.json`:

- `frontend-design` (anthropics/skills)
- `vercel-react-best-practices` (vercel-labs/agent-skills)

Apply them as practical guidance:

- Prefer clear component boundaries over monolithic TSX files.
- Reduce unnecessary re-renders and avoid heavy work in render paths.
- Defer non-critical code, and avoid bundle-heavy imports in hot paths.
- Maintain visual consistency (intentional typography, spacing, and interaction states).

## 11) Change Discipline for Agents

- Make focused, minimal diffs tied to the request.
- Avoid broad refactors unless explicitly asked.
- Never modify generated/build artifacts (`dist/`) manually.
- If you find duplicated legacy paths (for example, dual socket services), document before removing.
- When introducing new patterns (test runner, lint rule, architecture), update this `AGENTS.md` in the same PR.
