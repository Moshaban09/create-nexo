# NEXO CLI - Command Reference

## Commands

### `npx create-nexo [name]`

Create a new project interactively.

```bash
npx create-nexo my-app
npx create-nexo my-app --parallel
npx create-nexo my-app --dry-run
npx create-nexo my-app --preset=saas
npx create-nexo my-app --template=user/repo
npx create-nexo my-app --rtl
```

| Option | Description |
|--------|-------------|
| `-d, --dir <directory>` | Target directory (default: `.`) |
| `--dry-run` | Preview changes without creating files |
| `-p, --preset <preset>` | Use a preset (saas, dashboard, landing, etc.) |
| `--parallel` | Enable parallel execution (faster) |
| `--template <repo>` | Clone a project from a GitHub template |
| `--rtl` | Enable Arabic & RTL support (Cairo font, rtl dir) |
| `--audit` | Enable security audit during installation |
| `--strict` | Enable strict dependency resolution |
| `--learn` | Enable educational mode with explanations |

---

### `npx -p create-nexo nexo wizard` / `w`

Beginner-friendly wizard mode with project type recommendations.

```bash
npx -p create-nexo nexo wizard
npx -p create-nexo nexo w
```

**Project Types:**
- 🌐 Web Application
- 📊 Admin Dashboard
- 🚀 Landing Page
- 🔌 API Client
- 👤 Portfolio
- 🛒 E-Commerce

| Option | Description |
|--------|-------------|
| `-d, --dir <directory>` | Target directory (default: `.`) |
| `--audit` | Enable security audit during installation |
| `--strict` | Enable strict dependency resolution |

---

### `npx -p create-nexo nexo generate` (Planned)

> [!NOTE]
> This command is currently in development and will be available in a future release.

Generate components, hooks, pages, or features.

```bash
# Future Usage:
# npx -p create-nexo nexo generate component Button
# npx -p create-nexo nexo gc Button
```

---

### `npx -p create-nexo nexo check`

Run system & project health checks.

```bash
npx -p create-nexo nexo check
npx -p create-nexo nexo check --system
npx -p create-nexo nexo check --project
```

**Checks:**
- **System**: Node.js version, npm/pnpm/yarn availability, Git installation.
- **Project**: Security audit, lockfile check, best practices, and bundle analysis.

| Option | Description |
|--------|-------------|
| `-s, --system` | Run system checks only |
| `-p, --project` | Run project checks only |

---

### `npx -p create-nexo nexo presets`

List available project presets.

```bash
npx -p create-nexo nexo presets
```

---

### `npx -p create-nexo nexo update`

Self-update Nexo CLI to the latest version.

```bash
npx -p create-nexo nexo update
```

---

## Global Options

| Option | Description |
|--------|-------------|
| `-v, --version` | Show version number |
| `-h, --help` | Show help |
| `--verbose` | Enable verbose output for detailed logs |
