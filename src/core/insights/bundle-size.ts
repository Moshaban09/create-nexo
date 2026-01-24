
import { UserSelections } from '../../types/index.js';

/**
 * Approximate minified + gzipped sizes in kilobytes (kB)
 * Based on Bundlephobia data (approximate)
 */
const PACKAGE_SIZES: Record<string, number> = {
  // Frameworks (Base)
  'react': 2.5,
  'react-dom': 42,


  // Frameworks (Meta)

  'remix': 50,

  // UI Libraries
  'class-variance-authority': 1,
  'clsx': 0.4,
  'tailwind-merge': 1,

  '@chakra-ui/react': 100,

  // State
  'zustand': 1.1,
  '@reduxjs/toolkit': 12,
  'react-redux': 4.5,
  'jotai': 2.5,

  // Routing
  'react-router-dom': 16,
  '@tanstack/react-router': 13,

  // Data Fetching
  '@tanstack/react-query': 13,
  'axios': 12,


  // Forms
  'react-hook-form': 9,
  'zod': 13,
  '@hookform/resolvers': 2,

  // Utils
  'lucide-react': 5, // Per icon usually, but baseline

};

/**
 * Estimate the initial JS bundle size based on selections.
 * Returns a string like "145 kB"
 */
export const estimateBundleSize = (selections: UserSelections): number => {
  let size = 0;

  // Base bundle (React + DOM)
  size += PACKAGE_SIZES['react'] || 0;
  size += PACKAGE_SIZES['react-dom'] || 0;

  // UI
  if (selections.ui === 'shadcn') {
      size += (PACKAGE_SIZES['class-variance-authority'] || 0) +
              (PACKAGE_SIZES['clsx'] || 0) +
              (PACKAGE_SIZES['tailwind-merge'] || 0);
  }


  // State
  if (selections.state === 'zustand') size += PACKAGE_SIZES['zustand'] || 0;
  else if (selections.state === 'redux') {
      size += (PACKAGE_SIZES['@reduxjs/toolkit'] || 0) + (PACKAGE_SIZES['react-redux'] || 0);
  }
  else if (selections.state === 'jotai') size += PACKAGE_SIZES['jotai'] || 0;

  // Routing
  if (selections.routing === 'react-router') size += PACKAGE_SIZES['react-router-dom'] || 0;
  else if (selections.routing === 'tanstack-router') size += PACKAGE_SIZES['@tanstack/react-router'] || 0;

  // Data Fetching
  if (selections.dataFetching === 'tanstack-query') size += PACKAGE_SIZES['@tanstack/react-query'] || 0;
  else if (selections.dataFetching === 'axios') size += PACKAGE_SIZES['axios'] || 0;

  // Forms
  if (selections.forms?.includes('rhf')) {
      size += PACKAGE_SIZES['react-hook-form'] || 0;
      if (selections.forms.includes('zod')) {
          size += (PACKAGE_SIZES['zod'] || 0) + (PACKAGE_SIZES['@hookform/resolvers'] || 0);
      }
  }

  // Icons
  if (selections.icons === 'lucide') size += PACKAGE_SIZES['lucide-react'] || 0;

  // i18n


  return Number(size.toFixed(1));
};

export const formatSize = (kb: number): string => {
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(2)} MB`;
    }
    return `${kb} kB`;
};
