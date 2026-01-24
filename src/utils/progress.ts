import pc from 'picocolors';

// ============================================
// Progress Bar
// ============================================

export interface ProgressBar {
  /** Update progress by incrementing current step */
  increment: (stepName?: string) => void;
  /** Update progress to a specific value */
  update: (current: number, stepName?: string) => void;
  /** Mark progress as complete */
  complete: (message?: string) => void;
  /** Mark progress as failed */
  fail: (message?: string) => void;
  /** Get current progress percentage */
  getPercentage: () => number;
}

export interface ProgressBarOptions {
  /** Total number of steps */
  total: number;
  /** Width of the progress bar in characters */
  width?: number;
  /** Show percentage */
  showPercentage?: boolean;
  /** Show step count (e.g., "5/10") */
  showStepCount?: boolean;
  /** Custom complete character */
  completeChar?: string;
  /** Custom incomplete character */
  incompleteChar?: string;
  /** Color for the filled portion */
  filledColor?: (str: string) => string;
  /** Color for the empty portion */
  emptyColor?: (str: string) => string;
}

/**
 * Create a customizable progress bar
 */
export const createProgressBar = (options: ProgressBarOptions): ProgressBar => {
  const {
    total,
    width = 30,
    showPercentage = true,
    showStepCount = true,
    completeChar = '█',
    incompleteChar = '░',
    filledColor = pc.cyan,
    emptyColor = pc.dim,
  } = options;

  let current = 0;
  let currentStepName = '';

  const render = () => {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const bar = filledColor(completeChar.repeat(filled)) + emptyColor(incompleteChar.repeat(empty));

    let output = `\r${bar}`;

    if (showPercentage) {
      output += ` ${percentage.toString().padStart(3)}%`;
    }

    if (showStepCount) {
      output += ` (${current}/${total})`;
    }

    if (currentStepName) {
      output += ` ${pc.dim(currentStepName)}`;
    }

    // Clear the rest of the line
    output += '\x1b[K';

    process.stdout.write(output);
  };

  return {
    increment: (stepName?: string) => {
      current = Math.min(current + 1, total);
      currentStepName = stepName || '';
      render();
    },

    update: (value: number, stepName?: string) => {
      current = Math.min(Math.max(0, value), total);
      currentStepName = stepName || '';
      render();
    },

    complete: (message?: string) => {
      current = total;
      currentStepName = '';
      render();
      console.log();
      if (message) {
        console.log(pc.green(`✓ ${message}`));
      }
    },

    fail: (message?: string) => {
      currentStepName = '';
      console.log();
      if (message) {
        console.log(pc.red(`✗ ${message}`));
      }
    },

    getPercentage: () => Math.round((current / total) * 100),
  };
};

// ============================================
// Step Progress (with labels)
// ============================================

export interface StepProgress {
  /** Start a step */
  start: (stepName: string) => void;
  /** Complete current step successfully */
  succeed: (message?: string) => void;
  /** Fail current step */
  fail: (message?: string) => void;
  /** Skip current step */
  skip: (reason?: string) => void;
  /** Complete all steps */
  complete: () => void;
}

export interface StepProgressOptions {
  /** Total number of steps */
  total: number;
  /** Show step numbers */
  showStepNumbers?: boolean;
}

/**
 * Create a step-based progress indicator
 */
export const createStepProgress = (options: StepProgressOptions): StepProgress => {
  const { total, showStepNumbers = true } = options;

  let current = 0;
  let currentStep = '';

  const formatStep = () => {
    if (showStepNumbers) {
      return `[${current}/${total}]`;
    }
    return '';
  };

  return {
    start: (stepName: string) => {
      current++;
      currentStep = stepName;
      process.stdout.write(`${pc.cyan('●')} ${formatStep()} ${stepName}...`);
    },

    succeed: (message?: string) => {
      process.stdout.write(`\r${pc.green('✓')} ${formatStep()} ${message || currentStep}\x1b[K\n`);
    },

    fail: (message?: string) => {
      process.stdout.write(`\r${pc.red('✗')} ${formatStep()} ${message || currentStep}\x1b[K\n`);
    },

    skip: (reason?: string) => {
      const skipMsg = reason ? ` (${reason})` : '';
      process.stdout.write(`\r${pc.yellow('○')} ${formatStep()} ${currentStep}${pc.dim(skipMsg)}\x1b[K\n`);
    },

    complete: () => {
      console.log();
      console.log(pc.green(`✓ All ${total} steps completed successfully!`));
    },
  };
};

// ============================================
// Simple Progress Indicator
// ============================================

export interface SimpleProgress {
  /** Show progress message */
  log: (message: string) => void;
  /** Show success message */
  success: (message: string) => void;
  /** Show error message */
  error: (message: string) => void;
  /** Show warning message */
  warn: (message: string) => void;
  /** Show info message */
  info: (message: string) => void;
}

/**
 * Create a simple progress logger
 */
export const createSimpleProgress = (): SimpleProgress => {
  return {
    log: (message: string) => {
      console.log(`  ${message}`);
    },

    success: (message: string) => {
      console.log(`${pc.green('✓')} ${message}`);
    },

    error: (message: string) => {
      console.log(`${pc.red('✗')} ${message}`);
    },

    warn: (message: string) => {
      console.log(`${pc.yellow('⚠')} ${message}`);
    },

    info: (message: string) => {
      console.log(`${pc.blue('ℹ')} ${message}`);
    },
  };
};

// ============================================
// Timer Utility
// ============================================

export interface Timer {
  /** Get elapsed time in milliseconds */
  elapsed: () => number;
  /** Get formatted elapsed time string */
  format: () => string;
  /** Stop timer and return formatted time */
  stop: () => string;
}

/**
 * Create a simple timer
 */
export const createTimer = (): Timer => {
  const startTime = Date.now();
  let endTime: number | null = null;

  return {
    elapsed: () => {
      return (endTime || Date.now()) - startTime;
    },

    format: () => {
      const ms = (endTime || Date.now()) - startTime;
      if (ms < 1000) {
        return `${ms}ms`;
      }
      return `${(ms / 1000).toFixed(2)}s`;
    },

    stop: () => {
      endTime = Date.now();
      const ms = endTime - startTime;
      if (ms < 1000) {
        return `${ms}ms`;
      }
      return `${(ms / 1000).toFixed(2)}s`;
    },
  };
};
