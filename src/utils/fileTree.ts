import { UserSelections } from '../types/index.js';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export const generateFileTree = (selections: UserSelections): string => {
  const tree: TreeNode[] = [];
  const isTS = selections.variant.startsWith('ts');
  const ext = isTS ? 'ts' : 'js';
  const extx = isTS ? 'tsx' : 'jsx';

  // Root files
  tree.push({ name: 'package.json' });
  tree.push({ name: `vite.config.${ext}` });
  tree.push({ name: 'index.html' });
  if (isTS) {
    tree.push({ name: 'tsconfig.json' });
  }

  if (selections.styling === 'tailwind') {
    tree.push({ name: 'tailwind.config.js' });
    tree.push({ name: 'postcss.config.js' });
  }

  tree.push({ name: 'README.md' });
  tree.push({ name: 'DOCS.md' });
  tree.push({ name: '.env.example' });

  if (selections.ui === 'shadcn') {
    tree.push({ name: 'components.json' });
  }

  if (selections.backend === 'prisma') {
    tree.push({
      name: 'prisma/',
      children: [{ name: 'schema.prisma' }]
    });
  }

  // src folder
  const srcChildren: TreeNode[] = [
    { name: `main.${extx}` },
    { name: `App.${extx}` },
    { name: 'index.css' },
  ];

  // Feature-based structure
  if (selections.structure === 'feature-based') {
    srcChildren.push(
      { name: 'app/', children: [] },
      { name: 'features/', children: [] },
      {
        name: 'shared/',
        children: [
          { name: 'components/', children: [] },
          { name: 'hooks/', children: [] },
          { name: 'utils/', children: [] },
          { name: 'types/', children: [] },
        ]
      },
      { name: 'pages/', children: [] }
    );
  } else {
    // Simple structure
    srcChildren.push(
      { name: 'components/', children: [] },
      { name: 'hooks/', children: [] },
      { name: 'utils/', children: [] },
      { name: 'assets/', children: [] }
    );
  }

  // Backend generated files
  const libChildren: TreeNode[] = [];
  if (selections.ui === 'shadcn') {
    libChildren.push({ name: `utils.${ext}` });
  }

  if (selections.backend === 'supabase') {
    libChildren.push({ name: `supabase.${ext}` });
  } else if (selections.backend === 'firebase') {
    libChildren.push({ name: `firebase.${ext}` });
  } else if (selections.backend === 'prisma') {
    libChildren.push({ name: `prisma.${ext}` });
  }

  if (libChildren.length > 0) {
    srcChildren.push({ name: 'lib/', children: libChildren });
  }

  if (selections.backend === 'clerk') {
    srcChildren.push({
      name: 'providers/',
      children: [{ name: `clerk.${extx}` }]
    });
  }

  tree.push({ name: 'src/', children: srcChildren });

  // Render tree
  return renderTree(tree);
};

const renderTree = (nodes: TreeNode[], prefix = ''): string => {
  let result = '';
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    result += `${prefix}${connector}${node.name}\n`;

    if (node.children) {
      result += renderTree(node.children, prefix + childPrefix);
    }
  });
  return result;
};
