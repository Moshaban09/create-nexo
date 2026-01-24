import { ConfiguratorContext } from '../../types/index.js';

export const dataFetchingConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { dataFetching, framework } = ctx.selections;
  if (!dataFetching || dataFetching === 'none' || dataFetching === 'fetch') return;

  if (ctx.pkg) {
    if (dataFetching === 'tanstack-query' && framework === 'react') {
      ctx.pkg.add('@tanstack/react-query', '^5.59.0');
      ctx.pkg.add('@tanstack/react-query-devtools', '^5.59.0');
    } else if (dataFetching === 'axios') {
      ctx.pkg.add('axios', '^1.7.0');
    }
  }
};
