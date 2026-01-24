import { createDependencyConfigurator } from '../factory.js';

const ANIMATION_CONFIGS = {
  'framer-motion': {
    'framer-motion': '^12.0.0',
  },
  'gsap': {
    'gsap': '^3.14.2',
    '@gsap/react': '^2.1.2',
  },
  'react-spring': {
    '@react-spring/web': '^9.7.0',
  },
  'auto-animate': {
    '@formkit/auto-animate': '^0.8.2',
  },
};

export const animationConfigurator = createDependencyConfigurator('animation', ANIMATION_CONFIGS);
