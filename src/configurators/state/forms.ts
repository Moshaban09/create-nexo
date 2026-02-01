import { createDependencyConfigurator } from '../factory.js';

const FORMS_CONFIGS = {
  'rhf-zod': {
    'react-hook-form': '^7.60.0',
    'zod': '^3.25.0',
    '@hookform/resolvers': '^3.9.0',
  },
  'rhf-yup': {
    'react-hook-form': '^7.60.0',
    'yup': '^1.6.0',
    '@hookform/resolvers': '^3.9.0',
  },
  'tanstack-form': {
    '@tanstack/react-form': '^1.31.0',
    'zod': '^3.25.0',
  },
};

export const formsConfigurator = createDependencyConfigurator('forms', FORMS_CONFIGS);
