import { createDependencyConfigurator } from '../factory.js';

const ICONS_CONFIGS = {
  lucide: {
    'lucide-react': '^0.563.0',
  },
  'react-icons': {
    'react-icons': '^5.5.0',
  },
  iconify: {
    '@iconify/react': '^6.0.2',
  },
  heroicons: {
    '@heroicons/react': '^2.2.0',
  },
};

export const iconsConfigurator = createDependencyConfigurator('icons', ICONS_CONFIGS);
