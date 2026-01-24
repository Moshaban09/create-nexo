import pc from 'picocolors';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const successMark = pc.green('✔');
const failMark = pc.red('✖');

export interface Spinner {
  start: (text: string) => void;
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  stop: () => void;
}

export const createSpinner = (): Spinner => {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let frameIndex = 0;
  let currentText = '';

  const clearLine = () => {
    process.stdout.write('\r\x1b[K');
  };

  const render = () => {
    clearLine();
    process.stdout.write(`${pc.cyan(frames[frameIndex])} ${currentText}`);
    frameIndex = (frameIndex + 1) % frames.length;
  };

  return {
    start: (text: string) => {
      currentText = text;
      frameIndex = 0;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(render, 80);
      render();
    },

    succeed: (text?: string) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      clearLine();
      console.log(`${successMark} ${text || currentText}`);
    },

    fail: (text?: string) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      clearLine();
      console.log(`${failMark} ${text || currentText}`);
    },

    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      clearLine();
    },
  };
};

export const spinner = (text: string): Spinner => {
  const s = createSpinner();
  s.start(text);
  return s;
};
