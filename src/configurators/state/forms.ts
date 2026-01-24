import { createDependencyConfigurator } from '../factory.js';

const FORMS_CONFIGS = {
  'rhf-zod': {
    'react-hook-form': '^7.54.0',
    'zod': '^3.24.0',
    '@hookform/resolvers': '^3.9.0',
  },
  'rhf-yup': {
    'react-hook-form': '^7.54.0',
    'yup': '^1.6.0',
    '@hookform/resolvers': '^3.9.0',
  },
  'formik-zod': {
    'formik': '^2.4.6',
    'zod': '^3.24.0',
    'zod-formik-adapter': '^1.3.0',
  },
  'formik-yup': {
    'formik': '^2.4.6',
    'yup': '^1.6.0',
  },
  'tanstack-form': {
    '@tanstack/react-form': '^1.27.7',
    'zod': '^3.24.0',
  },
};

export const formsConfigurator = createDependencyConfigurator('forms', FORMS_CONFIGS);
