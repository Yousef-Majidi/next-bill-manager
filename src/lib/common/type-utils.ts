import { z } from "zod";

// type-safe utility functions for common operations

// type-safe object operations
export function isObjectType(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArrayType(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

export function isStringType(value: unknown): value is string {
	return typeof value === "string";
}

export function isNumberType(value: unknown): value is number {
	return typeof value === "number" && !Number.isNaN(value);
}

export function isBooleanType(value: unknown): value is boolean {
	return typeof value === "boolean";
}

export function isNull(value: unknown): value is null {
	return value === null;
}

export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

// type-safe object property access
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	return obj[key];
}

export function hasProperty<
	T extends Record<string, unknown>,
	K extends string,
>(obj: T, key: K): obj is T & Record<K, unknown> {
	return key in obj;
}

export function safeGetProperty<
	T extends Record<string, unknown>,
	K extends string,
>(obj: T, key: K): T[K] | undefined {
	return hasProperty(obj, key) ? obj[key] : undefined;
}

// type-safe array operations
export function safeArrayAccess<T>(array: T[], index: number): T | undefined {
	return array[index];
}

export function safeArraySlice<T>(
	array: T[],
	start?: number,
	end?: number,
): T[] {
	return array.slice(start, end);
}

export function safeArrayFilter<T>(
	array: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
): T[] {
	return array.filter(predicate);
}

export function safeArrayMap<T, U>(
	array: T[],
	mapper: (value: T, index: number, array: T[]) => U,
): U[] {
	return array.map(mapper);
}

export function safeArrayReduce<T, U>(
	array: T[],
	reducer: (
		accumulator: U,
		currentValue: T,
		currentIndex: number,
		array: T[],
	) => U,
	initialValue: U,
): U {
	return array.reduce(reducer, initialValue);
}

// type-safe string operations
export function safeStringLength(str: string): number {
	return str.length;
}

export function safeStringSubstring(
	str: string,
	start: number,
	end?: number,
): string {
	return str.substring(start, end);
}

export function safeStringToLowerCase(str: string): string {
	return str.toLowerCase();
}

export function safeStringToUpperCase(str: string): string {
	return str.toUpperCase();
}

export function safeStringTrim(str: string): string {
	return str.trim();
}

// type-safe number operations
export function safeNumberIsFinite(num: number): boolean {
	return Number.isFinite(num);
}

export function safeNumberIsInteger(num: number): boolean {
	return Number.isInteger(num);
}

export function safeNumberParseInt(str: string, radix?: number): number {
	const result = parseInt(str, radix);
	return Number.isNaN(result) ? 0 : result;
}

export function safeNumberParseFloat(str: string): number {
	const result = parseFloat(str);
	return Number.isNaN(result) ? 0 : result;
}

// type-safe date operations
export function isDateType(value: unknown): value is Date {
	return value instanceof Date;
}

export function safeDateNow(): number {
	return Date.now();
}

export function safeDateFromString(dateString: string): Date | null {
	const date = new Date(dateString);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function safeDateToISOString(date: Date): string {
	return date.toISOString();
}

// type-safe validation utilities
export function validateWithSchema<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): { success: true; data: T } | { success: false; error: string } {
	try {
		const validatedData = schema.parse(data);
		return { success: true, data: validatedData };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.errors[0]?.message || "Validation failed",
			};
		}
		return { success: false, error: "Unknown validation error" };
	}
}

export function safeValidateWithSchema<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): T | null {
	try {
		return schema.parse(data);
	} catch {
		return null;
	}
}

// type-safe deep clone
export function safeDeepClone<T>(value: T): T {
	if (value === null || typeof value !== "object") {
		return value;
	}

	if (value instanceof Date) {
		return new Date(value.getTime()) as T;
	}

	if (Array.isArray(value)) {
		return value.map(safeDeepClone) as T;
	}

	if (isObjectType(value)) {
		const cloned = {} as Record<string, unknown>;
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				cloned[key] = safeDeepClone(value[key]);
			}
		}
		return cloned as T;
	}

	return value;
}

// type-safe object merge
export function safeMerge<
	T extends Record<string, unknown>,
	U extends Record<string, unknown>,
>(target: T, source: U): T & U {
	const result = { ...target } as T & U;
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			(result as Record<string, unknown>)[key] = source[key];
		}
	}
	return result;
}

// type-safe object pick
export function safePick<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}

// type-safe object omit
export function safeOmit<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> {
	const result = { ...obj } as Omit<T, K>;
	for (const key of keys) {
		delete (result as Record<string, unknown>)[key as string];
	}
	return result;
}

// type-safe conditional operations
export function safeConditional<T, U>(
	condition: boolean,
	trueValue: T,
	falseValue: U,
): T | U {
	return condition ? trueValue : falseValue;
}

export function safeDefault<T>(
	value: T | null | undefined,
	defaultValue: T,
): T {
	return isNullOrUndefined(value) ? defaultValue : value;
}

// type-safe async operations
export async function safeAsyncOperation<T>(
	operation: () => Promise<T>,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
	try {
		const data = await operation();
		return { success: true, data };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// type-safe retry mechanism
export async function safeRetry<T>(
	operation: () => Promise<T>,
	maxRetries: number = 3,
	delay: number = 1000,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
	let lastError: string = "";

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const data = await operation();
			return { success: true, data };
		} catch (error) {
			lastError = error instanceof Error ? error.message : "Unknown error";

			if (attempt < maxRetries) {
				await new Promise((resolve) =>
					setTimeout(resolve, delay * (attempt + 1)),
				);
			}
		}
	}

	return { success: false, error: lastError };
}

// type-safe debounce
export function createDebouncedFunction<
	T extends (...args: unknown[]) => unknown,
>(func: T, delay: number): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}

// type-safe throttle
export function createThrottledFunction<
	T extends (...args: unknown[]) => unknown,
>(func: T, delay: number): (...args: Parameters<T>) => void {
	let lastCall = 0;

	return (...args: Parameters<T>) => {
		const now = Date.now();

		if (now - lastCall >= delay) {
			lastCall = now;
			func(...args);
		}
	};
}

// type-safe memoization
export function createMemoizedFunction<
	T extends (...args: unknown[]) => unknown,
>(func: T): T {
	const cache = new Map<string, unknown>();

	return ((...args: Parameters<T>) => {
		const key = JSON.stringify(args);

		if (cache.has(key)) {
			return cache.get(key);
		}

		const result = func(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

// type-safe environment variable access
export function getEnvVar(key: string): string | undefined {
	return process.env[key];
}

export function getRequiredEnvVar(key: string): string {
	const value = getEnvVar(key);
	if (!value) {
		throw new Error(`Required environment variable ${key} is not set`);
	}
	return value;
}

export function getEnvVarWithDefault(
	key: string,
	defaultValue: string,
): string {
	return getEnvVar(key) ?? defaultValue;
}

// type-safe URL operations
export function safeUrlParse(url: string): URL | null {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

export function safeUrlJoin(base: string, path: string): string {
	try {
		return new URL(path, base).toString();
	} catch {
		return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
	}
}

// type-safe JSON operations
export function safeJsonParse<T>(jsonString: string): T | null {
	try {
		return JSON.parse(jsonString) as T;
	} catch {
		return null;
	}
}

export function safeJsonStringify(value: unknown): string | null {
	try {
		return JSON.stringify(value);
	} catch {
		return null;
	}
}

// type-safe localStorage operations
export function safeLocalStorageGet<T>(key: string): T | null {
	try {
		const item = localStorage.getItem(key);
		return item ? safeJsonParse<T>(item) : null;
	} catch {
		return null;
	}
}

export function safeLocalStorageSet<T>(key: string, value: T): boolean {
	try {
		const jsonString = safeJsonStringify(value);
		if (jsonString === null) return false;
		localStorage.setItem(key, jsonString);
		return true;
	} catch {
		return false;
	}
}

export function safeLocalStorageRemove(key: string): boolean {
	try {
		localStorage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}

// type-safe sessionStorage operations
export function safeSessionStorageGet<T>(key: string): T | null {
	try {
		const item = sessionStorage.getItem(key);
		return item ? safeJsonParse<T>(item) : null;
	} catch {
		return null;
	}
}

export function safeSessionStorageSet<T>(key: string, value: T): boolean {
	try {
		const jsonString = safeJsonStringify(value);
		if (jsonString === null) return false;
		sessionStorage.setItem(key, jsonString);
		return true;
	} catch {
		return false;
	}
}

export function safeSessionStorageRemove(key: string): boolean {
	try {
		sessionStorage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}
