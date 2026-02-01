/**
 * NEXO CLI - Backend Configurator
 *
 * Configures BaaS (Backend-as-a-Service) integrations with:
 * - SDK installation
 * - Client configuration files
 * - Environment variable templates
 */

import path from 'node:path';
import type { ConfiguratorContext } from '../../types/index.js';
import { appendFile, ensureDir, pathExists, writeFile } from '../../utils/index.js';

// ============================================
// Dependencies
// ============================================

const BACKEND_DEPS: Record<string, Record<string, string>> = {
  supabase: {
    '@supabase/supabase-js': '^2.93.0',
  },
  firebase: {
    'firebase': '^12.8.0',
  },
  clerk: {
    '@clerk/clerk-react': '^5.60.0',
  },
  prisma: {
    '@prisma/client': '^7.3.0',
  },
};

// ============================================
// File Templates
// ============================================

const getSupabaseClient = (_isTypeScript: boolean) => `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`;

const getFirebaseClient = (_isTypeScript: boolean) => `import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
`;

const getClerkProvider = (isTypeScript: boolean) => {
  if (isTypeScript) {
    return `import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

interface ClerkAuthProviderProps {
  children: React.ReactNode
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  )
}
`;
  }
  return `import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

export function ClerkAuthProvider({ children }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  )
}
`;
};

const getPrismaClient = (isTypeScript: boolean) => {
  if (isTypeScript) {
    return `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
`;
  }
  return `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
`;
};

const PRISMA_SCHEMA = `// Prisma Schema
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model - customize as needed
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

// ============================================
// Environment Templates
// ============================================

const ENV_TEMPLATES: Record<string, string> = {
  supabase: `
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
`,
  firebase: `
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
`,
  clerk: `
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
`,
  prisma: `
# Database Connection (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
`,
};

// ============================================
// Configurator
// ============================================

export const backendConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const backend = ctx.selections.backend;
  if (!backend || backend === 'none') return;

  const deps = BACKEND_DEPS[backend];
  if (!deps) return;

  const isTypeScript = ctx.selections.variant.startsWith('ts');
  const ext = isTypeScript ? 'ts' : 'js';
  const extx = isTypeScript ? 'tsx' : 'jsx';

  // 1. Add dependencies
  if (ctx.pkg) {
    for (const [name, version] of Object.entries(deps)) {
      ctx.pkg.add(name, version);
    }
  }

  // 2. Create client files
  await ensureDir(path.join(ctx.projectPath, 'src/lib'));

  if (backend === 'supabase') {
    await writeFile(
      path.join(ctx.projectPath, 'src/lib', `supabase.${ext}`),
      getSupabaseClient(isTypeScript)
    );
  }

  if (backend === 'firebase') {
    await writeFile(
      path.join(ctx.projectPath, 'src/lib', `firebase.${ext}`),
      getFirebaseClient(isTypeScript)
    );
  }

  if (backend === 'clerk') {
    await ensureDir(path.join(ctx.projectPath, 'src/providers'));
    await writeFile(
      path.join(ctx.projectPath, 'src/providers', `clerk.${extx}`),
      getClerkProvider(isTypeScript)
    );
  }

  if (backend === 'prisma') {
    await writeFile(
      path.join(ctx.projectPath, 'src/lib', `prisma.${ext}`),
      getPrismaClient(isTypeScript)
    );
    // Create prisma schema
    await ensureDir(path.join(ctx.projectPath, 'prisma'));
    await writeFile(
      path.join(ctx.projectPath, 'prisma', 'schema.prisma'),
      PRISMA_SCHEMA
    );
  }

  // 3. Append to .env.example
  const envTemplate = ENV_TEMPLATES[backend];
  if (envTemplate) {
    const envPath = path.join(ctx.projectPath, '.env.example');
    const exists = await pathExists(envPath);
    if (exists) {
      await appendFile(envPath, envTemplate);
    } else {
      await writeFile(envPath, `# Environment Variables${envTemplate}`);
    }
  }
};
