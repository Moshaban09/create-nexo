/**
 * Tests for core/parallel.ts - Smart Concurrency Pool
 */
import { describe, expect, it } from 'vitest';
import { estimateTimeSavings, executeParallel, groupByLevel, type Step } from '../../src/core/parallel.js';

describe('Parallel Execution', () => {
  describe('executeParallel', () => {
    it('should execute steps in order when no concurrency', async () => {
      const order: string[] = [];
      const steps: Step[] = [
        { name: 'step1', fn: async () => { order.push('step1'); } },
        { name: 'step2', fn: async () => { order.push('step2'); }, dependencies: ['step1'] },
        { name: 'step3', fn: async () => { order.push('step3'); }, dependencies: ['step2'] },
      ];

      await executeParallel(steps, { maxConcurrency: 1 });

      expect(order).toEqual(['step1', 'step2', 'step3']);
    });

    it('should execute independent steps in parallel', async () => {
      const startTimes: Record<string, number> = {};
      const steps: Step[] = [
        { name: 'step1', fn: async () => { startTimes['step1'] = Date.now(); await delay(50); } },
        { name: 'step2', fn: async () => { startTimes['step2'] = Date.now(); await delay(50); } },
        { name: 'step3', fn: async () => { startTimes['step3'] = Date.now(); await delay(50); } },
      ];

      await executeParallel(steps, { maxConcurrency: 3 });

      // All should start at approximately the same time
      const times = Object.values(startTimes);
      const maxDiff = Math.max(...times) - Math.min(...times);
      expect(maxDiff).toBeLessThan(30); // Within 30ms
    });

    it('should respect maxConcurrency', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const steps: Step[] = Array.from({ length: 6 }, (_, i) => ({
        name: `step${i}`,
        fn: async () => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await delay(20);
          concurrent--;
        },
      }));

      await executeParallel(steps, { maxConcurrency: 2 });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('should respect dependencies', async () => {
      const order: string[] = [];
      const steps: Step[] = [
        { name: 'a', fn: async () => { order.push('a'); } },
        { name: 'b', fn: async () => { order.push('b'); }, dependencies: ['a'] },
        { name: 'c', fn: async () => { order.push('c'); }, dependencies: ['a'] },
        { name: 'd', fn: async () => { order.push('d'); }, dependencies: ['b', 'c'] },
      ];

      await executeParallel(steps);

      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'));
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'));
    });

    it('should throw on circular dependencies', async () => {
      const steps: Step[] = [
        { name: 'a', fn: async () => {}, dependencies: ['b'] },
        { name: 'b', fn: async () => {}, dependencies: ['a'] },
      ];

      await expect(executeParallel(steps)).rejects.toThrow(/Circular dependency/);
    });

    it('should propagate step errors', async () => {
      const steps: Step[] = [
        { name: 'step1', fn: async () => { throw new Error('Step failed'); } },
      ];

      await expect(executeParallel(steps)).rejects.toThrow('Step failed');
    });
  });

  describe('groupByLevel', () => {
    it('should group independent steps at level 0', () => {
      const steps: Step[] = [
        { name: 'a', fn: async () => {} },
        { name: 'b', fn: async () => {} },
      ];

      const levels = groupByLevel(steps);

      expect(levels).toHaveLength(1);
      expect(levels[0]).toHaveLength(2);
    });

    it('should group steps by dependency level', () => {
      const steps: Step[] = [
        { name: 'a', fn: async () => {} },
        { name: 'b', fn: async () => {}, dependencies: ['a'] },
        { name: 'c', fn: async () => {}, dependencies: ['b'] },
      ];

      const levels = groupByLevel(steps);

      expect(levels).toHaveLength(3);
      expect(levels[0].map(s => s.name)).toEqual(['a']);
      expect(levels[1].map(s => s.name)).toEqual(['b']);
      expect(levels[2].map(s => s.name)).toEqual(['c']);
    });
  });

  describe('estimateTimeSavings', () => {
    it('should estimate time savings for parallel execution', () => {
      const steps: Step[] = [
        { name: 'a', fn: async () => {} },
        { name: 'b', fn: async () => {} },
        { name: 'c', fn: async () => {} },
      ];

      const estimate = estimateTimeSavings(steps, 100);

      expect(estimate.sequential).toBe(300);
      expect(estimate.parallel).toBe(100);
      expect(estimate.savings).toBe(67); // ~67%
    });
  });
});

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
