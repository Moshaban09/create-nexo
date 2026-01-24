# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-01-24

### � New Features & Orchestration
- **New**: **Modular Architecture** — Complete refactor of the `create` command into discrete, maintainable modules.
- **New**: **Pre-Write Safety Checks** — Advanced validation for write permissions, disk space (100MB+), and path limits.
- **New**: **Network Resilience** — Exponential backoff (1s→2s→4s) and retry logic for reliable template cloning.
- **New**: **Security Guard** — Cross-platform path validation and forbidden directory scanning.
- **New**: **Centralized Ecosystem** — Unified constants and validation rules across the CLI.

### 🛠️ Stability & Fixes
- **Fixed**: Synchronized `package-lock.json` with `package.json` for deterministic builds.
- **Stability**: Refined path component validation for perfect Windows/Linux compatibility.
- **Improvement**: Enhanced error reporting with dedicated error classes (`NetworkError`, `SecurityError`).
- **Performance**: Optimized memory usage during project scaffolding.
- **Improved**: **Centralized Constants** — Moved all magic strings, path limits, and network configurations to a dedicated `src/constants` module.
- **Improved**: **Unified Validation Options** — Synchronized interactive UI options with core validation logic via centralized constants.

### 🛠️ Improvements & Fixes
- **Fixed**: Re-enabled `resolveLatestVersions` with proper network module integration and graceful fallback.
- **Fixed**: Path component validation now splits on both `/` and `\` for cross-platform compatibility.
- **Improvement**: Centralized project path validation in `validation.ts`.
- **Improvement**: Structured error handling with `formatError` in create command.
- **Improvement**: Enhanced test coverage with 236 passing tests.

### 📁 New Files
- `src/utils/fs-checks.ts` — Pre-write safety check utilities
- `src/errors/network-errors.ts` — Network-specific error classes
- `tests/unit/fs-checks.test.ts` — Pre-write checks unit tests
- `tests/unit/network-errors.test.ts` — Network errors unit tests
- `.github/workflows/ci.yml` — CI pipeline (build, lint, test)
- `.github/workflows/codeql.yml` — Security scanning
- `.github/workflows/publish.yml` — NPM auto-publish
- `.github/workflows/release.yml` — GitHub release automation
- `.github/dependabot.yml` — Dependency updates

## [1.4.1] - 2026-01-23

### 🚀 New Features
- **New**: **Multi-Package Manager Support** — Automatically detect and prompt for `npm`, `pnpm`, `Bun`, and `Yarn`.
- **New**: **Custom Templates** — Added `--template <repo>` flag to clone any GitHub repository using `tiged`.
- **Optimization**: **Template Infrastructure** — Added groundwork for preset-based GitHub templates (accessible via `--template` flag).
- **UX**: **Setup Progress Steps** — Added granular progress logging during project generation for better visibility.

### 🛠️ Improvements & Fixes
- **Stability**: Comprehensive linting and code quality cleanup (resolved 18+ issues).
- **Stability**: Unit test suite stabilization and updates (212+ tests passing).
- **Improvement**: Re-introduced `packageManager` selection for better user choice and performance.
- **Improvement**: Added recommendations for faster package managers (pnpm/Bun) when detected.
- **Improvement**: Enhanced `create` command with background prefetching for all template dependencies.
- **Fixed**: Corrected `package.json` name synchronization after template cloning.
- **Fixed**: Added `--legacy-peer-deps` to npm install to prevent ERESOLVE dependency conflicts.
- **Fixed**: Disabled automatic version resolution that was fetching non-existent package versions.
- **Fixed**: Removed TypeScript-only syntax (`declare module`) from JavaScript project templates.
- **Fixed**: Updated TanStack Query base versions to stable 5.59.0.
- **UX**: Added optimization hints for npm install flags.
- **Security**: Added `--audit` flag to `create` and `wizard` commands to enable security auditing during installation.
- **Stability**: Added `--strict` flag to `create` and `wizard` commands to enable strict dependency resolution (disable `--legacy-peer-deps`).
- **Security & Stability**: Added informative Magenta/Yellow color-coded notes in success output.
- **Security**: Added post-installation recommendation to run `nexo check` for a full security and health audit.

## [1.3.0] - 2026-01-22

### 🚀 New Features



- **New**: **Dry Run** — Added `--dry-run` flag to `update` command for safely previewing changes.
- **New**: **Verbose Mode** — Global `--verbose` flag for detailed debugging logs.
- **Security**: **Removed v8-compile-cache** — Eliminated dynamic code execution warning (eval) while maintaining build performance with esbuild.
- **Optimization**: **Single Binary Architecture** — Bundied all dependencies into one file (~226KB). No `node_modules` installation required for end users.
- **Optimization**: **Reduced Source Code** — Deleted legacy `src/index.ts`, `src/api`, `src/plugins`, and merged `validation` into `utils`.
- **Optimization**: **Test Suite Cleanup** — Removed unused tests for deleted features.
- **New**: **Instant Setup Refactor** — Implemented "Zero-Latency" I/O orchestration:
  - High-efficiency `PackageManager` for memory-resident `package.json` state.
  - Atomic Git operations (`init`, `add`, `commit` in one chain).
  - Parallelized dynamic imports using `Promise.all` for command bootstrapping.
  - Expanded background prefetching covering all core dependencies.

### 🛠️ Improvements & Fixes
- **Improvement**: Enhanced `ConfiguratorContext` resolve logic for complex dependencies.
- **Removed**: **UI & Styling** — Dropped `Mantine` and `Plain CSS`.
- **Removed**: **Commands** — Removed `nexo undo`.
- **Removed**: **Core Features** — Dropped i18n, Auth, Docker, and Monorepo support.
- **Removed**: **Prompts** — Removed framework selection prompt (now defaults to React).
- **Fixed**: **CLI Flags** — Removed conflicting `-V` short flag from `--verbose`.
- **Fixed**: **Test Suite** — Resolved 200+ test failures after the architecture refactor.

### ⚠️ Breaking Changes
- **Merged**: `nexo doctor` and `nexo health` are now unified into `nexo check`.
  - Use `nexo check` for full system + project health checks
  - Use `nexo check --system` for system-only checks (replaces `nexo doctor`)
  - Use `nexo check --project` for project-only checks (replaces `nexo health`)

## [1.2.0] - 2026-01-21

### 🛠️ Core Architecture
- **Refactor**: Split monolithic `nexo.ts` into a modular command structure (`src/commands/*`) for better maintainability and lazy loading.
- **Refactor**: Defined explicit `Command` interface with strict typing and options handling.
- **Refactor**: Modernized `ConfiguratorContext` and improved internal dependency management.

### 🧠 AI Intelligence & Context
- **New**: **Modular Cursor Rules** — Granular AI instructions (React, TS, Styling) with `cursor-modular` support.
- **New**: `.nexo/ai-context.md` generation as a single source of truth for AI agents.

### ⚡ Performance & UX
- **New**: **Persistent Disk Cache** — Caches npm metadata locally (`~/.nexo/cache.json`) for instant startup speed.
- **Optimization**: **Fast-Path I/O** — Skips writing files if the content is identical to existing files.
- **Optimization**: **Smart Concurrency Pool** — Enhanced parallel execution with active task management.
- **UX**: **Lightweight CLI Banner** — Added a professional ASCII branding to the startup flow.
- **Optimization**: **Single Bundle Build** — Fully minified and tree-shaken distribution with zero runtime dependencies.



### 🛠️ Maintenance & Commands
- **New**: `nexo update` — Self-update the CLI to the latest version.
- **New**: **Smart Resolution** — Automatically fetches and installs the latest versions from npm registry.

### 🧪 Testing & Documentation



### 🐛 Fixes
- **Fixed**: Resolved duplicate `require` and unused variables in core commands.
- **Fixed**: Corrected `undo` command path resolution in Windows environments.
- **Fixed**: Improved `HeroUI` extension handling for JavaScript projects.
- **Fixed**: Fixed `ConfiguratorContext` type mismatches in Maintenance commands.


## [1.1.6] - 2026-01-19

### Optimizations
- 📦 **Package Size Reduced by 80%** — From 837 KB to ~160 KB
- 🚀 **Build Time Reduced by 90%** — From ~3s to 0.31s
- 🗑️ Removed source maps and declaration files from production
- ⚡ Enabled minification and tree shaking
- 🎯 Updated Node.js target to Node 20 for better performance

## [1.1.4] - 2026-01-19

### Optimizations
- ⚙️ **Project Configuration** — Lowered Node.js requirement to `>=18.0.0`, added `clean`, `lint`, `format`, `release` scripts.
- 📦 **Expanded Dependencies** — Added `fs-extra`, `execa`, `ora`, `chalk` for better performance and DX.
- 🧹 **Linting & Formatting** — Integrated ESLint and Prettier configurations.

### Added
- 📂 **Existing Directory Handling** — Smart detection of existing projects with options to continue, overwrite, or cancel.

## [1.1.0] - 2026-01-18

### Added
- 🧩 **Constants Module** — Unified type-safe constants for all options
- 📁 **Config File Support** — Use `nexo.config.json` for pre-configured projects
- 🤖 **AI Instructions** — Auto-generate guides for Cursor, Gemini, Claude, and more
- 🎯 **Presets System** — Quick start with `minimal`, `standard`, `full`, `saas`, `dashboard`
- 📝 **Unified Logger** — Consistent CLI output with log levels

### Changed
- ⚡ **Parallel execution is now default** — Use `--no-parallel` for sequential mode
- 🗑️ Removed `packageManager` prompt for faster experience

### Fixed
- 🐛 HeroUI extension now correctly uses `.js` for JavaScript projects
- 🐛 Fixed duplicate condition checks in UI configurator

## [1.0.0] - 2026-01-18

### Added
- 🚀 Initial release
- Framework selection (React + Vite)
- TypeScript/JavaScript variants with React Compiler and SWC options
- Styling: Tailwind CSS v4, CSS Modules, Sass, Plain CSS
- UI Libraries: shadcn/ui, Radix, Mantine, HeroUI, Ant Design, Chakra
- Forms: React Hook Form + Zod/Yup, Formik + Zod/Yup
- State Management: Zustand, Redux Toolkit, Jotai
- Routing: React Router, TanStack Router
- Data Fetching: TanStack Query, Axios, Fetch
- Icons: Lucide, Heroicons, Font Awesome
- Project Structures: Feature-based, FSD, Atomic, Clean Architecture, MVC, Simple
- Optional Features: i18n, Auth, Testing, Linting, Animation, Docker, Monorepo
- Wizard mode for beginners
- Parallel execution for faster setup

### Coming Soon

