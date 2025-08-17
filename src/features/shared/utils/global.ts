import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// className utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// currency formatting utilities
export const roundToCurrency = (amount: number): number => {
	return Math.round(amount * 100) / 100;
};

export const formatCurrency = (amount: number, currency = "USD"): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);
};

// date utilities
export const formatDate = (
	date: Date,
	options?: Intl.DateTimeFormatOptions,
): string => {
	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

export const formatDateTime = (date: Date): string => {
	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

// validation utilities
export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
	const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
	return phoneRegex.test(phone);
};

// array utilities
export const groupBy = <T, K extends string | number | symbol>(
	array: T[],
	key: (item: T) => K,
): Record<K, T[]> => {
	return array.reduce(
		(groups, item) => {
			const groupKey = key(item);
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(item);
			return groups;
		},
		{} as Record<K, T[]>,
	);
};

export const uniqueBy = <T, K extends string | number | symbol>(
	array: T[],
	key: (item: T) => K,
): T[] => {
	const seen = new Set<K>();
	return array.filter((item) => {
		const keyValue = key(item);
		if (seen.has(keyValue)) {
			return false;
		}
		seen.add(keyValue);
		return true;
	});
};

// object utilities
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> => {
	const result = {} as Pick<T, K>;
	keys.forEach((key) => {
		if (key in obj) {
			result[key] = obj[key];
		}
	});
	return result;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> => {
	const result = { ...obj };
	keys.forEach((key) => {
		delete result[key];
	});
	return result;
};

// string utilities
export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (
	str: string,
	length: number,
	suffix = "...",
): string => {
	if (str.length <= length) return str;
	return str.slice(0, length) + suffix;
};

// async utilities
export const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
	fn: () => Promise<T>,
	maxAttempts = 3,
	delayMs = 1000,
): Promise<T> => {
	let lastError: Error;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (attempt === maxAttempts) break;
			await delay(delayMs * attempt);
		}
	}

	throw lastError!;
};
