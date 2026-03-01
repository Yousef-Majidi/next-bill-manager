// TypeScript performance optimizations

// type caching utilities
export class TypeCache<T> {
	private cache = new Map<string, T>();
	private maxSize: number;

	constructor(maxSize: number = 1000) {
		this.maxSize = maxSize;
	}

	set(key: string, value: T): void {
		if (this.cache.size >= this.maxSize) {
			// remove oldest entry (first key)
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) {
				this.cache.delete(firstKey);
			}
		}
		this.cache.set(key, value);
	}

	get(key: string): T | undefined {
		return this.cache.get(key);
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}
}

// lazy type evaluation utilities
export function createLazyType<T>(factory: () => T): () => T {
	let cached: T | undefined;
	return () => {
		if (cached === undefined) {
			cached = factory();
		}
		return cached;
	};
}

export function createLazyAsyncType<T>(
	factory: () => Promise<T>,
): () => Promise<T> {
	let cached: Promise<T> | undefined;
	return async () => {
		if (cached === undefined) {
			cached = factory();
		}
		return cached;
	};
}

// type memoization utilities
export function memoizeType<T extends (...args: unknown[]) => unknown>(
	fn: T,
	keyGenerator?: (...args: Parameters<T>) => string,
): T {
	const cache = new Map<string, unknown>();

	return ((...args: Parameters<T>) => {
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

		if (cache.has(key)) {
			return cache.get(key);
		}

		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

// type-safe weak map utilities
export class TypeSafeWeakMap<K extends object, V> {
	private weakMap = new WeakMap<K, V>();

	set(key: K, value: V): void {
		this.weakMap.set(key, value);
	}

	get(key: K): V | undefined {
		return this.weakMap.get(key);
	}

	has(key: K): boolean {
		return this.weakMap.has(key);
	}

	delete(key: K): boolean {
		return this.weakMap.delete(key);
	}
}

// type-safe weak set utilities
export class TypeSafeWeakSet<T extends object> {
	private weakSet = new WeakSet<T>();

	add(value: T): void {
		this.weakSet.add(value);
	}

	has(value: T): boolean {
		return this.weakSet.has(value);
	}

	delete(value: T): boolean {
		return this.weakSet.delete(value);
	}
}

// type pooling utilities for object reuse
export class TypePool<T> {
	private pool: T[] = [];
	private factory: () => T;
	private resetFunction?: (item: T) => void;
	private maxSize: number;

	constructor(
		factory: () => T,
		reset?: (item: T) => void,
		maxSize: number = 100,
	) {
		this.factory = factory;
		if (reset !== undefined) {
			this.resetFunction = reset;
		}
		this.maxSize = maxSize;
	}

	acquire(): T {
		if (this.pool.length > 0) {
			const item = this.pool.pop()!;
			if (this.resetFunction) {
				this.resetFunction(item);
			}
			return item;
		}
		return this.factory();
	}

	release(item: T): void {
		if (this.pool.length < this.maxSize) {
			this.pool.push(item);
		}
	}

	clear(): void {
		this.pool.length = 0;
	}

	size(): number {
		return this.pool.length;
	}
}

// type-safe performance measurement utilities
export class PerformanceMeasurer {
	private measurements = new Map<string, number[]>();

	start(label: string): void {
		performance.mark(`${label}-start`);
	}

	end(label: string): number {
		performance.mark(`${label}-end`);
		performance.measure(label, `${label}-start`, `${label}-end`);

		const measure = performance.getEntriesByName(label)[0];
		if (!measure) {
			return 0;
		}

		const duration = measure.duration;

		if (!this.measurements.has(label)) {
			this.measurements.set(label, []);
		}
		this.measurements.get(label)!.push(duration);

		// cleanup marks and measures
		performance.clearMarks(`${label}-start`);
		performance.clearMarks(`${label}-end`);
		performance.clearMeasures(label);

		return duration;
	}

	getAverage(label: string): number {
		const measurements = this.measurements.get(label);
		if (!measurements || measurements.length === 0) {
			return 0;
		}

		const sum = measurements.reduce((acc, val) => acc + val, 0);
		return sum / measurements.length;
	}

	getMin(label: string): number {
		const measurements = this.measurements.get(label);
		if (!measurements || measurements.length === 0) {
			return 0;
		}
		return Math.min(...measurements);
	}

	getMax(label: string): number {
		const measurements = this.measurements.get(label);
		if (!measurements || measurements.length === 0) {
			return 0;
		}
		return Math.max(...measurements);
	}

	clear(label?: string): void {
		if (label) {
			this.measurements.delete(label);
		} else {
			this.measurements.clear();
		}
	}
}

// type-safe memory management utilities
export class MemoryManager {
	private weakRefs = new Set<WeakRef<object>>();
	private finalizationRegistry: FinalizationRegistry<string>;

	constructor() {
		this.finalizationRegistry = new FinalizationRegistry((heldValue) => {
			// cleanup when object is garbage collected
			console.log(`Object with id ${heldValue} was garbage collected`);
		});
	}

	track<T extends object>(obj: T, id: string): T {
		this.weakRefs.add(new WeakRef(obj));
		this.finalizationRegistry.register(obj, id);
		return obj;
	}

	cleanup(): void {
		// remove dead weak refs
		for (const weakRef of this.weakRefs) {
			if (weakRef.deref() === undefined) {
				this.weakRefs.delete(weakRef);
			}
		}
	}

	getActiveCount(): number {
		let count = 0;
		for (const weakRef of this.weakRefs) {
			if (weakRef.deref() !== undefined) {
				count++;
			}
		}
		return count;
	}
}

// type-safe event emitter with performance optimizations
export interface EventEmitterOptions {
	maxListeners?: number;
}

export class TypeSafeEventEmitter {
	private events = new Map<string, Set<(...args: unknown[]) => void>>();
	private maxListeners: number;

	constructor(options: EventEmitterOptions = {}) {
		this.maxListeners = options.maxListeners || 10;
	}

	on(event: string, listener: (...args: unknown[]) => void): void {
		if (!this.events.has(event)) {
			this.events.set(event, new Set());
		}

		const listeners = this.events.get(event)!;
		if (listeners.size >= this.maxListeners) {
			console.warn(
				`Max listeners (${this.maxListeners}) exceeded for event: ${event}`,
			);
		}

		listeners.add(listener);
	}

	off(event: string, listener: (...args: unknown[]) => void): void {
		const listeners = this.events.get(event);
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.events.delete(event);
			}
		}
	}

	emit(event: string, ...args: unknown[]): void {
		const listeners = this.events.get(event);
		if (listeners) {
			// create a copy to avoid issues if listeners are removed during iteration
			const listenersCopy = Array.from(listeners);
			listenersCopy.forEach((listener) => {
				try {
					listener(...args);
				} catch (error) {
					console.error(`Error in event listener for ${event}:`, error);
				}
			});
		}
	}

	once(event: string, listener: (...args: unknown[]) => void): void {
		const onceWrapper = (...args: unknown[]) => {
			this.off(event, onceWrapper);
			listener(...args);
		};
		this.on(event, onceWrapper);
	}

	removeAllListeners(event?: string): void {
		if (event) {
			this.events.delete(event);
		} else {
			this.events.clear();
		}
	}

	listenerCount(event: string): number {
		const listeners = this.events.get(event);
		return listeners ? listeners.size : 0;
	}
}

// type-safe request animation frame utilities
export class RequestAnimationFrameManager {
	private callbacks = new Map<number, () => void>();
	private nextId = 1;

	request(callback: () => void): number {
		const id = this.nextId++;
		this.callbacks.set(id, callback);

		requestAnimationFrame(() => {
			const cb = this.callbacks.get(id);
			if (cb) {
				cb();
				this.callbacks.delete(id);
			}
		});

		return id;
	}

	cancel(id: number): boolean {
		return this.callbacks.delete(id);
	}

	clear(): void {
		this.callbacks.clear();
	}
}
