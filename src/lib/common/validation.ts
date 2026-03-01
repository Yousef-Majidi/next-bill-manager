import { z } from "zod";

// type guards for runtime validation
export const isString = (value: unknown): value is string => {
	return typeof value === "string";
};

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
	return typeof value === "boolean";
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
	return Array.isArray(value);
};

export const isDate = (value: unknown): value is Date => {
	return value instanceof Date;
};

export const isEmail = (value: unknown): value is string => {
	if (!isString(value)) return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
};

export const isUrl = (value: unknown): value is string => {
	if (!isString(value)) return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

// validation schemas using zod
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().nonnegative();
export const dateSchema = z.date();
export const stringSchema = z.string().min(1);

// utility functions for validation
export const validateEmail = (email: unknown): string => {
	return emailSchema.parse(email);
};

export const validateUrl = (url: unknown): string => {
	return urlSchema.parse(url);
};

export const validatePositiveNumber = (num: unknown): number => {
	return positiveNumberSchema.parse(num);
};

export const validateNonNegativeNumber = (num: unknown): number => {
	return nonNegativeNumberSchema.parse(num);
};

export const validateDate = (date: unknown): Date => {
	return dateSchema.parse(date);
};

export const validateString = (str: unknown): string => {
	return stringSchema.parse(str);
};

// safe validation functions that return null on failure
export const safeValidateEmail = (email: unknown): string | null => {
	try {
		return emailSchema.parse(email);
	} catch {
		return null;
	}
};

export const safeValidateNumber = (num: unknown): number | null => {
	try {
		return z.number().parse(num);
	} catch {
		return null;
	}
};

// type assertion helpers
export const assertString = (
	value: unknown,
	message = "Expected string",
): string => {
	if (!isString(value)) {
		throw new TypeError(message);
	}
	return value;
};

export const assertNumber = (
	value: unknown,
	message = "Expected number",
): number => {
	if (!isNumber(value)) {
		throw new TypeError(message);
	}
	return value;
};

export const assertBoolean = (
	value: unknown,
	message = "Expected boolean",
): boolean => {
	if (!isBoolean(value)) {
		throw new TypeError(message);
	}
	return value;
};

export const assertObject = (
	value: unknown,
	message = "Expected object",
): Record<string, unknown> => {
	if (!isObject(value)) {
		throw new TypeError(message);
	}
	return value;
};

export const assertArray = (
	value: unknown,
	message = "Expected array",
): unknown[] => {
	if (!isArray(value)) {
		throw new TypeError(message);
	}
	return value;
};
