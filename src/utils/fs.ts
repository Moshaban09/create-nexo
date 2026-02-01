import fs from 'node:fs/promises';
import path from 'node:path';
import { ConfiguratorContext } from '../types/index.js';
import { preWriteChecks } from './fs-checks.js';

// Check if path exists
export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Ensure directory exists
export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

// Read JSON file
export const readJson = async <T = Record<string, unknown>>(filePath: string): Promise<T> => {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
};

// Write JSON file
export const writeJson = async (filePath: string, data: unknown, spaces = 2): Promise<void> => {
  await fs.writeFile(filePath, JSON.stringify(data, null, spaces) + '\n');
};

// Write file
export const writeFile = async (filePath: string, content: string): Promise<void> => {
  // Fast-path: Check if file exists and content is identical
  if (await pathExists(filePath)) {
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      if (existingContent === content) {
        return;
      }
    } catch {
      // Ignore read errors, proceed to write
    }
  }
  await fs.writeFile(filePath, content);
};

// Append to file
export const appendFile = async (filePath: string, content: string): Promise<void> => {
  await fs.appendFile(filePath, content);
};

// Remove file
export const removeFile = async (filePath: string): Promise<void> => {
  await fs.unlink(filePath);
};

// Remove directory recursively
export const remove = async (filePath: string): Promise<void> => {
  await fs.rm(filePath, { recursive: true, force: true });
};

// Copy file or directory
export const copy = async (src: string, dest: string): Promise<void> => {
  await fs.cp(src, dest, { recursive: true });
};

// Create project directory with pre-write safety checks
export const createProjectDir = async (ctx: ConfiguratorContext): Promise<void> => {
  // Run pre-write safety checks (permissions, disk space, path length)
  await preWriteChecks(ctx.projectPath);

  await ensureDir(ctx.projectPath);
  await ensureDir(path.join(ctx.projectPath, 'src'));
};

// Package.json helpers
export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export const getPackageJson = async (ctx: { projectPath: string; selections?: { projectName: string } }): Promise<PackageJson> => {
  const pkgPath = path.join(ctx.projectPath, 'package.json');
  if (await pathExists(pkgPath)) {
    return await readJson<PackageJson>(pkgPath);
  }
  return {
    name: ctx.selections?.projectName || 'my-nexo-app',
    version: '0.1.0',
    private: true,
    type: 'module',
    dependencies: {},
    devDependencies: {},
    scripts: {},
  };
};

export const savePackageJson = async (ctx: ConfiguratorContext, pkg: PackageJson): Promise<void> => {
  await writeJson(path.join(ctx.projectPath, 'package.json'), pkg);
};

export const addDependency = (
  pkg: PackageJson,
  name: string,
  version: string,
  isDev = false
): void => {
  if (isDev) {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies[name] = version;
  } else {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies[name] = version;
  }
};

export const addScript = (pkg: PackageJson, name: string, command: string): void => {
  pkg.scripts = pkg.scripts || {};
  pkg.scripts[name] = command;
};
