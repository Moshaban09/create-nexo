/**
 * Parallel execution engine for Configurators
 */
import pc from 'picocolors';

export interface Step {
  name: string;
  fn: () => Promise<void>;
  /** Dependencies - step names that must complete first */
  dependencies?: string[];
}

export interface ParallelExecutorOptions {
  /** Show individual step progress */
  verbose?: boolean;
  /** Maximum concurrent steps */
  maxConcurrency?: number;
}

interface StepState {
  step: Step;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: Error;
}

/**
 * Execute steps with dependency resolution and smart concurrency pool
 * Uses an active task pool that dynamically fills available slots
 */
export const executeParallel = async (
  steps: Step[],
  options: ParallelExecutorOptions = {}
): Promise<void> => {
  const { verbose = false, maxConcurrency = 4 } = options;

  // Initialize state
  const states = new Map<string, StepState>();
  for (const step of steps) {
    states.set(step.name, { step, status: 'pending' });
  }

  const completed = new Set<string>();
  const activePromises = new Map<string, Promise<void>>();

  /**
   * Check if a step's dependencies are satisfied
   */
  const canRun = (step: Step): boolean => {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true;
    }
    return step.dependencies.every((dep) => completed.has(dep));
  };

  /**
   * Get all steps that are ready to run (pending + dependencies met)
   */
  const getReadySteps = (): Step[] => {
    const ready: Step[] = [];
    for (const [_name, state] of states) {
      if (state.status === 'pending' && canRun(state.step)) {
        ready.push(state.step);
      }
    }
    return ready;
  };

  /**
   * Execute a single step and update state
   */
  const runStep = async (step: Step): Promise<void> => {
    const state = states.get(step.name)!;
    state.status = 'running';

    if (verbose) {
      process.stdout.write(`${pc.cyan('●')} ${step.name}...\r`);
    }

    try {
      await step.fn();
      state.status = 'completed';
      completed.add(step.name);

      if (verbose) {
        console.log(`${pc.green('✓')} ${step.name}`);
      }
    } catch (error) {
      state.status = 'failed';
      state.error = error instanceof Error ? error : new Error(String(error));

      if (verbose) {
        console.log(`${pc.red('✗')} ${step.name}`);
      }
      throw state.error;
    }
  };

  /**
   * Fill available slots with ready tasks (Smart Concurrency Pool)
   */
  const fillPool = (): void => {
    const availableSlots = maxConcurrency - activePromises.size;
    if (availableSlots <= 0) return;

    const readySteps = getReadySteps();
    const stepsToStart = readySteps.slice(0, availableSlots);

    for (const step of stepsToStart) {
      const state = states.get(step.name)!;
      if (state.status !== 'pending') continue; // Double-check

      const promise = runStep(step).finally(() => {
        activePromises.delete(step.name);
      });
      activePromises.set(step.name, promise);
    }
  };

  // Main execution loop with smart pool management
  while (completed.size < steps.length) {
    // Fill pool with ready tasks
    fillPool();

    if (activePromises.size === 0) {
      // Check for circular dependencies or all failed
      const pending = [...states.values()].filter((s) => s.status === 'pending');
      const failed = [...states.values()].filter((s) => s.status === 'failed');

      if (failed.length > 0) {
        throw failed[0].error || new Error('Step execution failed');
      }

      if (pending.length > 0) {
        const names = pending.map((s) => s.step.name).join(', ');
        throw new Error(`Circular dependency or unmet dependencies detected: ${names}`);
      }
      break;
    }

    // Wait for any task to complete, then immediately try to fill the pool
    await Promise.race(activePromises.values());
  }
};

/**
 * Group steps by their dependency level for visualization
 */
export const groupByLevel = (steps: Step[]): Step[][] => {
  const levels: Step[][] = [];
  const placed = new Set<string>();

  while (placed.size < steps.length) {
    const level: Step[] = [];

    for (const step of steps) {
      if (placed.has(step.name)) continue;

      const deps = step.dependencies || [];
      if (deps.every((d) => placed.has(d))) {
        level.push(step);
      }
    }

    if (level.length === 0) {
      throw new Error('Circular dependency detected');
    }

    level.forEach((s) => placed.add(s.name));
    levels.push(level);
  }

  return levels;
};

/**
 * Estimate time savings from parallel execution
 */
export const estimateTimeSavings = (
  steps: Step[],
  avgStepTime: number = 100
): { sequential: number; parallel: number; savings: number } => {
  const levels = groupByLevel(steps);

  const sequential = steps.length * avgStepTime;
  const parallel = levels.length * avgStepTime;
  const savings = Math.round(((sequential - parallel) / sequential) * 100);

  return { sequential, parallel, savings };
};
