import { ConfiguratorContext } from '../../types/index.js';

const STATE_CONFIGS: Record<string, Record<string, string>> = {
  zustand: {
    'zustand': '^5.0.0',
  },
  redux: {
    '@reduxjs/toolkit': '^2.5.0',
    'react-redux': '^9.2.0',
  },
  jotai: {
    'jotai': '^2.11.0',
  },



};


export const stateConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  if (ctx.selections.state === 'none') return;

  const config = STATE_CONFIGS[ctx.selections.state];
  if (!config) return;

  if (!config) return;

  if (ctx.pkg) {
    for (const [name, version] of Object.entries(config)) {
      ctx.pkg.add(name, version);
    }
  }

  if (ctx.selections.state === 'redux') {
    const isTypeScript = ctx.selections.variant.startsWith('ts');
    const ext = isTypeScript ? 'ts' : 'js';
    const { writeFile, ensureDir } = await import('../../utils/index.js');
    const path = await import('node:path');

    await ensureDir(path.join(ctx.projectPath, 'src/store'));

    // Create store
    const storeContent = `import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

${isTypeScript ? `export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch` : ''}
`;
    await writeFile(path.join(ctx.projectPath, 'src/store', `store.${ext}`), storeContent);

    // Create example slice
    const sliceContent = `import { createSlice } from '@reduxjs/toolkit'
${isTypeScript ? "import type { PayloadAction } from '@reduxjs/toolkit'\n\nexport interface CounterState {\n  value: number\n}" : ''}

const initialState${isTypeScript ? ': CounterState' : ''} = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action${isTypeScript ? ': PayloadAction<number>' : ''}) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default counterSlice.reducer
`;
    await writeFile(path.join(ctx.projectPath, 'src/store', `counterSlice.${ext}`), sliceContent);

    // Create hooks
    const hooksContent = isTypeScript
      ? `import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
`
      : `import { useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = useDispatch
export const useAppSelector = useSelector
`;
    await writeFile(path.join(ctx.projectPath, 'src/store', `hooks.${ext}`), hooksContent);
    await writeFile(path.join(ctx.projectPath, 'src/store', `hooks.${ext}`), hooksContent);
  }


};

