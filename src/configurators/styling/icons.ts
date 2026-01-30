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
  fontawesome: {
    '@fortawesome/fontawesome-svg-core': '^6.7.0',
    '@fortawesome/free-solid-svg-icons': '^6.7.0',
    '@fortawesome/react-fontawesome': '^0.2.2',
  },
};

export const iconsConfigurator = createDependencyConfigurator('icons', ICONS_CONFIGS);
