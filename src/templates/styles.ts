/**
 * CSS styles generator (App.css)
 */
import path from 'node:path';
import type { ConfiguratorContext } from '../types/index.js';
import { writeFile } from '../utils/index.js';

/**
 * Generate App.css for non-Tailwind projects
 */
const getAppCss = (isRtl: boolean): string => `
:root {
  --bg-dark: #0a0a0a;
  --text-white: #ffffff;
  --text-gray: #a3a3a3;
  --border-color: #262626;
  --card-bg: rgba(23, 23, 23, 0.5);
  --primary: #8b5cf6;
  --cyan: #06b6d4;
}

body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-white);
  font-family: ${isRtl ? "'Cairo', " : ''}system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  ${isRtl ? 'text-align: right;' : ''}
}

.app-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.background-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 10;
  max-width: 64rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 4rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: #22d3ee;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.title {
  font-size: 3.75rem;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 1rem 0;
  background: linear-gradient(to bottom right, #ffffff 30%, rgba(255,255,255,0.5));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: var(--text-gray);
  font-size: 1.125rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 56rem;
  margin-bottom: 3rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 2rem;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: #404040;
  background: rgba(23, 23, 23, 0.8);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.icon {
  font-size: 1.25rem;
  padding: 0.5rem;
  background: #262626;
  border-radius: 0.75rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: #d4d4d4;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: default;
}

.tag:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: white;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-gray);
  font-size: 0.9375rem;
}

.number {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #262626;
  border: 1px solid #404040;
  color: white;
  font-size: 0.75rem;
  font-family: monospace;
}

code {
  background: rgba(6, 182, 212, 0.1);
  color: #22d3ee;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.8em;
}

.footer {
  color: #525252;
  font-size: 0.875rem;
}
`;

/**
 * Create App.css file for non-Tailwind projects

 */
export const createAppCss = async (ctx: ConfiguratorContext): Promise<void> => {
  // Skip for non-React frameworks - they have their own style setup
  // Check styling selection

  const { styling } = ctx.selections;

  if (styling !== 'tailwind') {
    const srcDir = path.join(ctx.projectPath, 'src');
    await writeFile(path.join(srcDir, 'App.css'), getAppCss(ctx.selections.rtl === true));
  }
};
