import { createDependencyConfigurator } from '../factory.js';

const ANIMATION_CONFIGS = {
  'framer-motion': {
    'framer-motion': '^12.0.0',
  },
  'gsap': {
    'gsap': '^3.14.2',
    '@gsap/react': '^2.1.2',
  },
};

export const animationConfigurator = createDependencyConfigurator('animation', ANIMATION_CONFIGS);
