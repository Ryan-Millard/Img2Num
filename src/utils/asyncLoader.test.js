import { describe, it, expect, vi } from 'vitest';
import { loadItemsSequentially, loadItemsParallel } from './asyncLoader';

describe('asyncLoader', () => {
  describe('loadItemsSequentially', () => {
    it('should load items in sequence', async () => {
      const items = [1, 2, 3];
      const fetchItem = vi.fn(async (item) => item * 2);

      const results = await loadItemsSequentially(items, fetchItem);

      expect(results).toEqual([2, 4, 6]);
      expect(fetchItem).toHaveBeenCalledTimes(3);
    });

    it('should call onItem callback for each item', async () => {
      const items = ['a', 'b', 'c'];
      const fetchItem = vi.fn(async (item) => item.toUpperCase());
      const onItem = vi.fn();

      await loadItemsSequentially(items, fetchItem, onItem);

      expect(onItem).toHaveBeenCalledTimes(3);
      expect(onItem).toHaveBeenCalledWith('A');
      expect(onItem).toHaveBeenCalledWith('B');
      expect(onItem).toHaveBeenCalledWith('C');
    });

    it('should maintain order of execution', async () => {
      const items = [1, 2, 3];
      const order = [];
      const fetchItem = async (item) => {
        order.push(`start-${item}`);
        await new Promise((resolve) => setTimeout(resolve, (4 - item) * 10)); // Reverse delay
        order.push(`end-${item}`);
        return item;
      };

      await loadItemsSequentially(items, fetchItem);

      // Should execute in order despite different delays
      expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2', 'start-3', 'end-3']);
    });

    it('should handle empty items array', async () => {
      const fetchItem = vi.fn();
      const onItem = vi.fn();

      const results = await loadItemsSequentially([], fetchItem, onItem);

      expect(results).toEqual([]);
      expect(fetchItem).not.toHaveBeenCalled();
      expect(onItem).not.toHaveBeenCalled();
    });

    it('should handle fetchItem that returns objects', async () => {
      const items = [1, 2, 3];
      const fetchItem = async (item) => ({ id: item, value: item * 10 });

      const results = await loadItemsSequentially(items, fetchItem);

      expect(results).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 },
      ]);
    });

    it('should work without onItem callback', async () => {
      const items = [5, 10, 15];
      const fetchItem = async (item) => item + 1;

      const results = await loadItemsSequentially(items, fetchItem);

      expect(results).toEqual([6, 11, 16]);
    });

    it('should propagate errors from fetchItem', async () => {
      const items = [1, 2, 3];
      const fetchItem = async (item) => {
        if (item === 2) throw new Error('Fetch failed');
        return item;
      };

      await expect(loadItemsSequentially(items, fetchItem)).rejects.toThrow('Fetch failed');
    });

    it('should stop processing on error', async () => {
      const items = [1, 2, 3, 4];
      const fetchItem = vi.fn(async (item) => {
        if (item === 3) throw new Error('Error at 3');
        return item;
      });

      await expect(loadItemsSequentially(items, fetchItem)).rejects.toThrow();

      // Should only call fetchItem up to the error
      expect(fetchItem).toHaveBeenCalledTimes(3);
    });

    it('should handle async delays correctly', async () => {
      const items = [1, 2, 3];
      const delays = [];
      const fetchItem = async (item) => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - start);
        return item;
      };

      await loadItemsSequentially(items, fetchItem);

      // All delays should be ~50ms or more
      delays.forEach((delay) => expect(delay).toBeGreaterThanOrEqual(45));
    });

    it('should handle different data types', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const fetchItem = async (item) => ({ ...item, processed: true });

      const results = await loadItemsSequentially(items, fetchItem);

      expect(results).toEqual([
        { id: 1, processed: true },
        { id: 2, processed: true },
        { id: 3, processed: true },
      ]);
    });
  });

  describe('loadItemsParallel', () => {
    it('should load items in parallel', async () => {
      const items = [1, 2, 3];
      const fetchItem = vi.fn(async (item) => item * 2);

      const results = await loadItemsParallel(items, fetchItem);

      expect(results).toEqual([2, 4, 6]);
      expect(fetchItem).toHaveBeenCalledTimes(3);
    });

    it('should call onItem callback for each item as they complete', async () => {
      const items = ['a', 'b', 'c'];
      const fetchItem = vi.fn(async (item) => item.toUpperCase());
      const onItem = vi.fn();

      await loadItemsParallel(items, fetchItem, onItem);

      expect(onItem).toHaveBeenCalledTimes(3);
      expect(onItem).toHaveBeenCalledWith('A');
      expect(onItem).toHaveBeenCalledWith('B');
      expect(onItem).toHaveBeenCalledWith('C');
    });

    it('should execute items concurrently', async () => {
      const items = [1, 2, 3];
      const timestamps = [];
      const fetchItem = async (item) => {
        timestamps.push({ item, start: Date.now() });
        await new Promise((resolve) => setTimeout(resolve, 50));
        timestamps.push({ item, end: Date.now() });
        return item;
      };

      await loadItemsParallel(items, fetchItem);

      // All items should start at approximately the same time
      const startTimes = timestamps.filter((t) => t.start).map((t) => t.start);
      const maxStartDiff = Math.max(...startTimes) - Math.min(...startTimes);
      expect(maxStartDiff).toBeLessThan(30); // All should start within 30ms
    });

    it('should maintain result order despite completion order', async () => {
      const items = [1, 2, 3];
      const fetchItem = async (item) => {
        // Item 3 completes first, item 1 completes last
        await new Promise((resolve) => setTimeout(resolve, (4 - item) * 20));
        return item * 10;
      };

      const results = await loadItemsParallel(items, fetchItem);

      // Results should still be in original order
      expect(results).toEqual([10, 20, 30]);
    });

    it('should handle empty items array', async () => {
      const fetchItem = vi.fn();
      const onItem = vi.fn();

      const results = await loadItemsParallel([], fetchItem, onItem);

      expect(results).toEqual([]);
      expect(fetchItem).not.toHaveBeenCalled();
      expect(onItem).not.toHaveBeenCalled();
    });

    it('should work without onItem callback', async () => {
      const items = [5, 10, 15];
      const fetchItem = async (item) => item + 1;

      const results = await loadItemsParallel(items, fetchItem);

      expect(results).toEqual([6, 11, 16]);
    });

    it('should propagate errors from fetchItem', async () => {
      const items = [1, 2, 3];
      const fetchItem = async (item) => {
        if (item === 2) throw new Error('Fetch failed');
        return item;
      };

      await expect(loadItemsParallel(items, fetchItem)).rejects.toThrow('Fetch failed');
    });

    it('should call onItem even if other items fail', async () => {
      const items = [1, 2, 3];
      const onItem = vi.fn();
      const fetchItem = async (item) => {
        await new Promise((resolve) => setTimeout(resolve, item * 10));
        if (item === 3) throw new Error('Error at 3');
        return item;
      };

      await expect(loadItemsParallel(items, fetchItem, onItem)).rejects.toThrow();

      // onItem should have been called for items that completed before error
      expect(onItem).toHaveBeenCalledTimes(2);
      expect(onItem).toHaveBeenCalledWith(1);
      expect(onItem).toHaveBeenCalledWith(2);
    });

    it('should be faster than sequential for same workload', async () => {
      const items = [1, 2, 3, 4, 5];
      const delay = 50;
      const fetchItem = async (item) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return item;
      };

      // Parallel execution
      const parallelStart = Date.now();
      await loadItemsParallel(items, fetchItem);
      const parallelTime = Date.now() - parallelStart;

      // Sequential execution
      const sequentialStart = Date.now();
      await loadItemsSequentially(items, fetchItem);
      const sequentialTime = Date.now() - sequentialStart;

      // Parallel should be significantly faster
      expect(parallelTime).toBeLessThan(sequentialTime * 0.5);
    });

    it('should handle fetchItem that returns objects', async () => {
      const items = [1, 2, 3];
      const fetchItem = async (item) => ({ id: item, value: item * 10 });

      const results = await loadItemsParallel(items, fetchItem);

      expect(results).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 },
      ]);
    });

    it('should handle large number of items', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const fetchItem = async (item) => item * 2;

      const results = await loadItemsParallel(items, fetchItem);

      expect(results).toHaveLength(100);
      expect(results[0]).toBe(0);
      expect(results[99]).toBe(198);
    });

    it('should handle different data types', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const fetchItem = async (item) => ({ ...item, processed: true });

      const results = await loadItemsParallel(items, fetchItem);

      expect(results).toEqual([
        { id: 1, processed: true },
        { id: 2, processed: true },
        { id: 3, processed: true },
      ]);
    });
  });

  describe('comparison between sequential and parallel', () => {
    it('should produce same results regardless of method', async () => {
      const items = [5, 2, 8, 1, 9];
      const fetchItem = async (item) => item * 3;

      const sequentialResults = await loadItemsSequentially(items, fetchItem);
      const parallelResults = await loadItemsParallel(items, fetchItem);

      expect(sequentialResults).toEqual(parallelResults);
    });

    it('should call onItem same number of times for both methods', async () => {
      const items = [1, 2, 3, 4, 5];
      const fetchItem = async (item) => item;

      const seqOnItem = vi.fn();
      await loadItemsSequentially(items, fetchItem, seqOnItem);

      const parOnItem = vi.fn();
      await loadItemsParallel(items, fetchItem, parOnItem);

      expect(seqOnItem).toHaveBeenCalledTimes(parOnItem.mock.calls.length);
    });
  });
});