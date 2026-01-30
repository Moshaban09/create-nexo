# NEXO CLI - Command Reference

## Commands

### `nexo create [name]`

Create a new project interactively.

```bash
nexo create my-app
nexo create my-app --parallel
nexo create my-app --dry-run
nexo create my-app --cicd
nexo create my-app --preset=saas
```

| Option | Description |
|--------|-------------|
| `--parallel` | Enable parallel execution (faster) |
| `--dry-run` | Preview without creating files |
| `--cicd` | Include GitHub Actions workflow |
| `--preset=<name>` | Use a preset configuration |
| `--rtl` | **[New]** Enable Arabic & RTL support (Cairo font, rtl dir) |

---

### `nexo wizard` / `nexo w`

Beginner-friendly wizard mode with project type recommendations.

```bash
nexo wizard
nexo w
```

**Project Types:**
- 🌐 Web Application
- 📊 Admin Dashboard
- 🚀 Landing Page
- 🔌 API Client
- 👤 Portfolio
- 🛒 E-Commerce

---

### `nexo generate <type> <name>` / `nexo g`

Generate components, hooks, pages, or features.

```bash
# Components
nexo generate component Button
nexo gc Button
nexo gc Button --with-tests --with-styles --with-index
nexo gc Button -d src/components/ui

# Hooks
nexo generate hook useAuth
nexo gh useAuth

# Pages
nexo generate page Dashboard

# Features (FSD style)
nexo generate feature auth
```

| Option | Description |
|--------|-------------|
| `--with-tests` | Include test file |
| `--with-styles` | Include style file |
| `--with-index` | Include index.ts export |
| `-d, --directory` | Custom output directory |
| `--js` | Use JavaScript instead of TypeScript |

---

### `nexo check`

Run system & project health checks.

```bash
nexo check
nexo check --system
nexo check --project
```

**Checks:**
- **System**: Node.js version, npm/pnpm/yarn availability, Git installation.
- **Project**: Dependency audits, structural integrity, and best practice alignment.

---

### `nexo presets`

List available project presets.

```bash
nexo presets
```

**Available Presets:**
- `saas` - SaaS starter with auth, i18n, dashboard
- `landing` - Landing page with animations
- `dashboard` - Admin dashboard template
- `minimal` - Minimal setup
- `[Custom]` - Your saved presets from `nexo create`

---

## Global Options

| Option | Description |
|--------|-------------|
| `-v, --version` | Show version number |
| `-h, --help` | Show help |

---

## Examples

### Create a full-featured SaaS project

```bash
nexo create my-saas --preset=saas --cicd
```

### Create with parallel execution

```bash
nexo create my-app --parallel
```

### Preview project structure

```bash
nexo create my-app --dry-run
```

### Create an Arabic & RTL project

```bash
nexo create my-arabic-app --rtl
```

### Generate feature with tests

```bash
nexo gc UserProfile --with-tests --with-styles
```
