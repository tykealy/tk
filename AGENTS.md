# Agent Guidelines for TK Stories Project

## Build/Lint/Test Commands
- Dev: `npm run dev` (uses turbopack)
- Build: `npm run build`
- Lint: `npm run lint`
- Start: `npm start`
- **No test framework configured** - no test commands available

## Tech Stack
- Next.js 15.4.6 (App Router), React 19.1.0, TypeScript 5
- Tiptap editor, Supabase (database + storage), SCSS modules
- Path alias: `@/` → `src/`

## Code Style
- **Imports**: External packages → internal modules → styles. Use `import type` for types
- **Quotes**: Double quotes for strings
- **Client components**: Add `"use client"` directive at top
- **Naming**: camelCase for variables/functions, PascalCase for components, kebab-case for files
- **Types**: Use TypeScript strictly, define interfaces/types from Supabase Database types
- **Error handling**: try/catch with console.error, throw meaningful errors
- **Async**: Use async/await, not .then()
- **Hooks**: Custom hooks in `src/hooks/use-*.ts`, follow React hooks rules

## No existing Cursor/Copilot rules found
