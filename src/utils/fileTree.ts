import { UserSelections } from '../types/index.js';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export const generateFileTree = (selections: UserSelections): string => {
  const tree: TreeNode[] = [];
  const isTS = selections.variant.includes('ts');
  const ext = isTS ? 'tsx' : 'jsx';
  const configExt = isTS ? 'ts' : 'js';
  // Root files
  tree.push({ name: 'package.json' });

  // React/Vite specific files
  tree.push({ name: 'vite.config.' + configExt });
  tree.push({ name: 'index.html' });
  if (isTS) {
    tree.push({ name: 'tsconfig.json' });
  }
  if (selections.styling === 'tailwind') {
    tree.push({ name: 'tailwind.config.js' });
  }

  tree.push({ name: 'README.md' });

  if (selections.ui === 'shadcn') {
    tree.push({ name: 'components.json' });
  }

  // src folder
  const srcChildren: TreeNode[] = [
    { name: `main.${ext}` },
    { name: `App.${ext}` },
    { name: 'index.css' },
  ];

  // State management
  if (selections.state === 'redux') {
    srcChildren.push({
      name: 'store/',
      children: [
        { name: 'store.' + configExt },
        { name: 'hooks.' + configExt },
        { name: 'counterSlice.' + configExt },
      ],
    });
  }

  // Shadcn utils
  if (selections.ui === 'shadcn') {
    srcChildren.push({
      name: 'lib/',
      children: [{ name: 'utils.' + configExt }],
    });
  }

  // Structure-based folders
  if (selections.structure === 'fsd') {
    srcChildren.push(
      { name: 'app/', children: [] },
      { name: 'pages/', children: [] },
      { name: 'widgets/', children: [] },
      { name: 'features/', children: [] },
      { name: 'entities/', children: [] },
      { name: 'shared/', children: [] }
    );
  } else if (selections.structure === 'clean') {
    srcChildren.push(
      { name: 'domain/', children: [] },
      { name: 'application/', children: [] },
      { name: 'infrastructure/', children: [] },
      { name: 'presentation/', children: [] }
    );
  } else {
    srcChildren.push(
      { name: 'components/', children: [] },
      { name: 'hooks/', children: [] },
      { name: 'utils/', children: [] },
      { name: 'assets/', children: [] }
    );
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
