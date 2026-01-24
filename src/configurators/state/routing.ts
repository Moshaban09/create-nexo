
import { ConfiguratorContext } from '../../types/index.js';


export const routingConfigurator = async (ctx: ConfiguratorContext) => {
  const { routing } = ctx.selections;

  // React Router / TanStack Router Logic
  if (routing === 'react-router') {
    if (ctx.pkg) ctx.pkg.add('react-router-dom', '^7.1.0');
  } else if (routing === 'tanstack-router') {
    if (ctx.pkg) {
      ctx.pkg.add('@tanstack/react-router', '^1.95.0');
      ctx.pkg.add('@tanstack/react-router-devtools', '^1.95.0');
    }
  }
};

