import { getCached } from './cache.js';

const ALL_PACKAGES = [
  // Core
  'react', 'react-dom', 'vite', 'typescript', '@vitejs/plugin-react',
  // Styling
  'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'styled-components',
  // UI Libraries
  'shadcn', 'lucide-react', '@heroui/react', '@mui/material', 'antd', '@chakra-ui/react',
  // Forms
  'react-hook-form', 'zod', 'yup', 'formik', '@tanstack/react-form',
  // State
  'zustand', 'redux', '@reduxjs/toolkit', 'jotai',
  // Routing
  'react-router-dom', '@tanstack/react-router',
  // Data Fetching
  '@tanstack/react-query', 'axios',
  // Icons
  'react-icons', '@iconify/react', 'heroicons', '@fortawesome/fontawesome-svg-core',
  // Utils
  'clsx', 'tailwind-merge', 'framer-motion'
];

/**
 * Prefetch latest versions of common packages in the background
 */
export const prefetchCommonPackages = (): void => {
  // Fire and forget - don't await to avoid blocking CLI interaction
  ALL_PACKAGES.forEach(async (name) => {
    try {
      await getCached(
        `npm:version:${name}`,
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          try {
            const response = await fetch(`https://registry.npmjs.org/${name}/latest`, {
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) return '';
            const data = await response.json() as { version: string };
            return data.version;
          } catch {
            return '';
          } finally {
            clearTimeout(timeoutId);
          }
        },
        12 * 60 * 60 * 1000
      );
    } catch {
      // Silently fail prefetch
    }
  });
};
