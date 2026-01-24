<div align="center">

# 🚀 NEXO CLI
**Next-generation, extensible CLI for scaffolding and orchestrating modern frontend projects**

[![npm version](https://img.shields.io/npm/v/create-nexo.svg?style=flat-square&color=cyan)](https://www.npmjs.com/package/create-nexo)
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
- 🎨 **Visual Excellence** — Premier styling with **Tailwind CSS v4**, Sass, and official **shadcn/ui** and **HeroUI** integrations.
- 🧱 **Scalable Architecture** — Professionally scaffolded **FSD**, **Feature-based**, and **Clean Architecture** patterns.
- 🧠 **AI-Native Context** — Auto-generated `.nexo/ai-context.md` for perfect alignment with modern AI coding agents.
- ⚡ **Instant Setup** — Zero-latency I/O with memory-resident `package.json` management; saved exactly once per project.
- 🚀 **Atomic Orchestration** — Combined Git operations and parallel module loading for lightning-fast command execution.
- 🛠️ **Unified Maintenance** — Total project health, security, and bundle auditing via the single `check` command.
- 👀 **Dry Run Safety** — Preview every file and structural change before they ever touch your disk.
- 📦 **Zero-Dependency Binary** — Entire CLI is bundled into a single file (~226KB) for instant installation and startup.
- 🚚 **Multi-PM Support** — Native detection and optimization for **pnpm**, **Bun**, and **Yarn**.
- 🏗️ **Template Cloning** — Lightning-fast scaffolding using **GitHub templates** with `tiged` integration and **3-retry resilience**.
- 🛡️ **Pre-Write Safety** — Permission checks, disk space validation (100MB+), and Windows **MAX_PATH** protection.
- 🔄 **Network Resilience** — Exponential backoff retry logic with GitHub rate limit detection and offline error guidance.
- 🏎️ **Optimized npm** — High-performance `npm` strategy with offline caching and audit bypass for 30% faster installs.
- 📊 **Auto Version Resolution** — Automatically fetches latest package versions with graceful fallback to stable defaults.

---

## 📦 Quick Start

```bash
# Recommended (Instant execution)
npx create-nexo@latest

# Or using the npm create shorthand
npm create nexo@latest

# Global installation (optional)
npm install -g create-nexo
nexo create my-app
```

---

## 🎯 Command Suite

| Command | Description |
|---------|-------------|
| `nexo create` | Start a new project with interactive prompts |
| `nexo create --audit` | Enable security audit during installation |
| `nexo create --strict` | Enable strict dependency resolution |
| `nexo create --template` | Clone a project from a GitHub template |
| `nexo wizard` | Guided project creation for beginners |
| `nexo presets` | List and use optimized project presets |
| `nexo check` | Run system & project health checks |
| `nexo update` | Self-update Nexo CLI to the latest version |

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
