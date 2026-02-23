<div align="center">

# 🚀 NEXO CLI
**Next-generation, extensible CLI for scaffolding and orchestrating modern frontend projects**

[![npm version](https://img.shields.io/badge/npm-v1.8.1-cyan.svg?style=flat-square)](https://www.npmjs.com/package/create-nexo)
[![npm downloads](https://img.shields.io/npm/dm/create-nexo.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/create-nexo)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square)](https://nodejs.org/)

🌐 **[Official Website](https://nexo-site-ten.vercel.app/)** | 📖 **[Documentation](./docs/cli.md)**

</div>

---

## 🎯 Core Features & Ecosystem

NEXO combines a cutting-edge tech stack with a powerful orchestration engine for an elite development experience.

- ⚛️ **Modern Foundation** — Native **React 19** support with **React Compiler**, built for speed on the leading **Vite** engine.
- 📜 **TypeScript First** — Strict **TS 5.7+** standards out of the box for ultimate type safety and reliability.
- 🎨 **Visual Excellence** — Premier styling with **Tailwind CSS v4**, and official **shadcn/ui** and **HeroUI** integrations.
- 🧱 **Structured Architecture** — Professionally scaffolded **Feature-based** architecture patterns for scalability.
- 🔌 **Backend Integration (BaaS)** — Built-in setup for **Supabase**, **Firebase**, **Clerk**, and **Prisma** with auto-generated clients.
- 🧠 **AI-Native Context** — Auto-generated `.nexo/ai-context.md` for perfect alignment with modern AI coding agents.
- 📚 **Smart Documentation** — Auto-generated `DOCS.md` with direct links to official documentation for your chosen stack.
- ⚡ **Instant Setup** — Zero-latency I/O with memory-resident `package.json` management; saved exactly once per project.
- 💾 **Custom Presets** — Save and reuse your favorite tech stacks (`~/.nexo/presets.json`) for one-click project creation.
- ⚡ **Smart Prefetching** — Background caching for **npm**, **pnpm**, and **yarn** during setup, reducing install time by up to 70%.
- 🌍 **Arabic & RTL Native** — Core support for RTL direction, `lang="ar"` configuration, and professional **Cairo font** integration.
- 🚀 **Atomic Orchestration** — Combined Git operations and parallel module loading for lightning-fast command execution.
- 🛠️ **Unified Maintenance** — Total project health, security, and bundle auditing via the single `check` command.
- 👀 **Dry Run Safety** — Preview every file and structural change before they ever touch your disk.
- 🚚 **Multi-PM Support** — Native detection and optimization for **pnpm**, **Bun**, and **Yarn**.
- 🏗️ **Template Cloning** — Lightning-fast scaffolding using **GitHub templates** with `giget` integration and **3-retry resilience**.
- 🛡️ **Pre-Write Safety** — Permission checks, disk space validation (100MB+), and Windows **MAX_PATH** protection.
- 🔄 **Network Resilience** — Exponential backoff retry logic with GitHub rate limit detection and offline error guidance.
- 🏎️ **Optimized npm** — High-performance `npm` strategy with clean outputs and audit bypass for 30% faster installs.
- 📊 **Auto Version Resolution** — Automatically fetches latest package versions with graceful fallback to stable defaults.
- 📈 **Install Stats** — Detailed performance metrics and caching summaries after every installation.
- 🎨 **UI RTL-Ready** — Specialized support for **Ant Design** RTL configuration and professional Arabic typography.
- 🔐 **Environment Templates** — Auto-generates `.env.example` with required variables for your chosen backend services.

---

## 📂 Project Structure

NEXO generates a clean, scalable structure tailored to your choices (e.g., Feature-based).

```plaintext
my-app/
├── public/              # Static assets
├── src/
│   ├── app/             # App providers & global layout
│   ├── features/        # Feature-based modules (slices)
│   ├── pages/           # Route components
│   ├── shared/          # Shared components, hooks, and utils
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── lib/             # Generated clients (Supabase/Firebase/Prisma)
│   ├── App.tsx          # Main entry component
│   └── main.tsx         # Application entry point
├── .nexo/               # AI Context & Metadata
├── .cursorrules         # AI-specific coding rules
├── DOCS.md              # Documentation for your specific stack
├── .env.example         # Environment templates
├── index.html
├── package.json
└── vite.config.ts
```

---

---

## 📦 Quick Start

```bash
# Recommended (Instant execution)
npx create-nexo@latest

# Create with a specific preset (Fastest)
npx create-nexo@latest my-app -p dashboard

# Or using the npm create shorthand
npm create nexo@latest
```

---

## 🎯 Command Suite

> [!TIP]
> **Execution**: Always use `npx create-nexo` for the default command or `npx -p create-nexo nexo [command]` for specific actions.

### Project Creation

```bash
# Interactive mode (Recommended for first-time users)
npx create-nexo my-app

# Quick setup with a preset
npx create-nexo my-app --preset=dashboard

# Arabic & RTL support
npx create-nexo my-app --rtl

# Preview changes without creating files
npx create-nexo my-app --dry-run
```

### Commands Reference

| Command | Description |
|---------|-------------|
| `npx create-nexo <app-name>` | Start a new project with interactive prompts |
| `npx create-nexo <app-name> --preset=dashboard` | Use a preset (saas, dashboard, landing, etc.) |
| `npx create-nexo <app-name> --rtl` | Enable Arabic & RTL support |
| `npx create-nexo <app-name> --dry-run` | Preview changes without creating files |
| `npx create-nexo <app-name> --audit` | Enable security audit during installation |
| `npx create-nexo <app-name> --strict` | Enable strict dependency resolution |

### Utility Commands

| Command | Description |
|---------|-------------|
| `npx -p create-nexo nexo wizard` | Guided project creation for beginners (Alias: `w`) |
| `npx -p create-nexo nexo presets` | List available project presets |
| `npx -p create-nexo nexo check` | Run system & project health checks |
| `npx -p create-nexo nexo update` | Self-update to the latest version |

---

## 🎨 Tech Stack Ecosystem

### Build Variants
- **React 19 + Compiler** — The future of React with auto-memoization.
- **TypeScript + Vite** — Industry standard for speed and safety.
- **SWC Transformation** — Ultra-fast builds for massive projects.

### Styling & UI
- **Tailwind CSS v4** — Utility-first with the latest engine features.
- **shadcn/ui** — Beautiful, accessible, and fully customizable.
- **HeroUI** — Feature-rich component libraries.

### State & Data
- **Zustand / Redux Toolkit** — Scalable state management.
- **TanStack Query** — Advanced caching and data synchronization.
- **TanStack Router / React Router** — Type-safe navigation.

### Backend & Services
- **Supabase** — Open source Firebase alternative.
- **Firebase** — Google's mobile and web application development platform.
- **Clerk** — Complete user management and authentication.
- **Prisma** — Next-generation ORM for Node.js and TypeScript.

---

## 🧠 AI Integration

Nexo is designed for the age of AI. Every project includes:
- **`.nexo/ai-context.md`**: A comprehensive source of truth for your stack, used by LLMs to provide more accurate code.
- **Modular Cursor Rules**: Specialized `.cursorrules` that adapt to your specific choices (React, Tailwind, Zustand, etc.).
- **Architecture Context**: Explains project structure and patterns to AI agents for perfect code generation.
---

## 🛠️ Development & Contribution

```bash
git clone https://github.com/Moshaban09/create-nexo.git
cd create-nexo
npm install
npm run build
npm link
```

---

## 📄 License

MIT © 2026 **Mohamed Shaban**

---

<div align="center">

**Built with ❤️ for the modern web**

[Report Bug](https://github.com/Moshaban09/create-nexo/issues) • [Request Feature](https://github.com/Moshaban09/create-nexo/issues)

</div>
