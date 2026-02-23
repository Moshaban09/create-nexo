import path from 'node:path';
import type { ConfiguratorContext } from '../types/index.js';
import { PackageJson, getPackageJson, writeJson } from './fs.js';


export class PackageManager {
  private projectPath: string;
  private pkg: PackageJson | null = null;
  private dependencies: Map<string, string> = new Map();
  private devDependencies: Map<string, string> = new Map();
  private scripts: Map<string, string> = new Map();
  private overrides: Map<string, string> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Load existing package.json if available
   */
  async load(ctx: ConfiguratorContext): Promise<void> {
    this.pkg = await getPackageJson(ctx);

    // Hydrate maps from existing package.json
    if (this.pkg.dependencies) {
      Object.entries(this.pkg.dependencies).forEach(([k, v]) => this.dependencies.set(k, v));
    }
    if (this.pkg.devDependencies) {
      Object.entries(this.pkg.devDependencies).forEach(([k, v]) => this.devDependencies.set(k, v));
    }
    if (this.pkg.scripts) {
      Object.entries(this.pkg.scripts).forEach(([k, v]) => this.scripts.set(k, v));
    }
    if (this.pkg.overrides) {
      Object.entries(this.pkg.overrides as Record<string, string>).forEach(([k, v]) => this.overrides.set(k, v));
    }
  }

  /**
   * Add a dependency
   */
  add(name: string, version: string, isDev: boolean = false): void {
    if (isDev) {
      this.devDependencies.set(name, version);
    } else {
      this.dependencies.set(name, version);
    }
  }

  /**
   * Add a script
   */
  addScript(name: string, command: string): void {
    this.scripts.set(name, command);
  }

  /**
   * Add a dependency override
   */
  addOverride(name: string, version: string): void {
    this.overrides.set(name, version);
  }

  /**
   * Set a top-level property
   */
  set(key: string, value: unknown): void {
    if (this.pkg) {
      (this.pkg as Record<string, unknown>)[key] = value;
    }
  }
  /**
   * Resolve latest versions for all dependencies from npm registry.
   * Falls back to hardcoded versions if fetching fails.
   *
   * This method is now improved with:
   * - Proper cache API usage
   * - Fallback to network.ts FALLBACK_VERSIONS
   * - Better error handling for scoped packages
   * - Graceful degradation on network failures
   */
  async resolveLatestVersions(): Promise<void> {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') return;

    const allDeps = [...this.dependencies.keys()];
    const allDevDeps = [...this.devDependencies.keys()];
    const all = [...new Set([...allDeps, ...allDevDeps])];

    if (all.length === 0) return;

    // Import network module for fallback versions
    const { getLatestVersion } = await import('../core/network.js');

    // Fetch latest versions in parallel with timeout
    const results = await Promise.allSettled(
      all.map(async (name) => {
        try {
          // Use the network module which has proper caching and fallbacks
          const version = await getLatestVersion(name);
          return { name, version };
        } catch {
          return { name, version: null };
        }
      })
    );

    // Apply fetched versions (only if valid semver format)
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.version) {
        const { name, version } = result.value;

        // Validate version format (must start with ^ and have valid semver)
        // Accept versions like "^19.0.0" or "latest"
        if (version === 'latest' || /^\^?\d+\.\d+\.\d+/.test(version)) {
          // Ensure version has ^ prefix if it's a semver
          const normalizedVersion = version === 'latest'
            ? version
            : version.startsWith('^') ? version : `^${version}`;

          if (this.dependencies.has(name)) {
            this.dependencies.set(name, normalizedVersion);
          }
          if (this.devDependencies.has(name)) {
            this.devDependencies.set(name, normalizedVersion);
          }
        }
      }
      // If fetch failed, the original hardcoded version remains untouched
    }
  }

  /**
   * Save changes to package.json
   */
  async save(): Promise<void> {
    if (!this.pkg) {
      throw new Error('Package.json not loaded. Call load() first.');
    }

    // Sort dependencies alphabetically
    const sortMap = (map: Map<string, string>) => {
      return Object.fromEntries(
        [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      );
    };

    this.pkg.dependencies = sortMap(this.dependencies);
    this.pkg.devDependencies = sortMap(this.devDependencies);
    this.pkg.scripts = sortMap(this.scripts);
    if (this.overrides.size > 0) {
      this.pkg.overrides = sortMap(this.overrides);
    }

    await writeJson(path.join(this.projectPath, 'package.json'), this.pkg);
  }
}
