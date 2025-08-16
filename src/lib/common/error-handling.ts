import { z } from "zod";

// type-safe error handling system

// base error types
export interface BaseError {
	message: string;
	code: string;
	timestamp: number;
	context?: Record<string, unknown> | undefined;
}

export interface ValidationError extends BaseError {
	code: "VALIDATION_ERROR";
	field?: string | undefined;
	value?: unknown;
	schema?: string | undefined;
}

export interface DatabaseError extends BaseError {
	code: "DATABASE_ERROR";
	operation: "CREATE" | "READ" | "UPDATE" | "DELETE";
	collection?: string | undefined;
	documentId?: string | undefined;
}

export interface AuthenticationError extends BaseError {
	code: "AUTHENTICATION_ERROR";
	reason:
		| "INVALID_CREDENTIALS"
		| "TOKEN_EXPIRED"
		| "INSUFFICIENT_PERMISSIONS"
		| "ACCOUNT_LOCKED";
	userId?: string | undefined;
}

export interface NetworkError extends BaseError {
	code: "NETWORK_ERROR";
	url?: string | undefined;
	statusCode?: number | undefined;
	method?: string | undefined;
}

export interface BusinessLogicError extends BaseError {
	code: "BUSINESS_LOGIC_ERROR";
	operation: string;
	entity?: string | undefined;
	entityId?: string | undefined;
}

export interface UnknownError extends BaseError {
	code: "UNKNOWN_ERROR";
	originalError?: unknown;
}

// union type for all errors
export type AppError =
	| ValidationError
	| DatabaseError
	| AuthenticationError
	| NetworkError
	| BusinessLogicError
	| UnknownError;

// error codes enum
export const ErrorCodes = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	DATABASE_ERROR: "DATABASE_ERROR",
	AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// error factory functions
export function createValidationError(
	message: string,
	field?: string,
	value?: unknown,
	schema?: string,
	context?: Record<string, unknown>,
): ValidationError {
	const error: ValidationError = {
		message,
		code: "VALIDATION_ERROR",
		timestamp: Date.now(),
	};

	if (field !== undefined) error.field = field;
	if (value !== undefined) error.value = value;
	if (schema !== undefined) error.schema = schema;
	if (context !== undefined) error.context = context;

	return error;
}

export function createDatabaseError(
	message: string,
	operation: DatabaseError["operation"],
	collection?: string,
	documentId?: string,
	context?: Record<string, unknown>,
): DatabaseError {
	return {
		message,
		code: "DATABASE_ERROR",
		timestamp: Date.now(),
		operation,
		collection,
		documentId,
		context,
	};
}

export function createAuthenticationError(
	message: string,
	reason: AuthenticationError["reason"],
	userId?: string,
	context?: Record<string, unknown>,
): AuthenticationError {
	return {
		message,
		code: "AUTHENTICATION_ERROR",
		timestamp: Date.now(),
		reason,
		userId,
		context,
	};
}

export function createNetworkError(
	message: string,
	url?: string,
	statusCode?: number,
	method?: string,
	context?: Record<string, unknown>,
): NetworkError {
	return {
		message,
		code: "NETWORK_ERROR",
		timestamp: Date.now(),
		url,
		statusCode,
		method,
		context,
	};
}

export function createBusinessLogicError(
	message: string,
	operation: string,
	entity?: string,
	entityId?: string,
	context?: Record<string, unknown>,
): BusinessLogicError {
	return {
		message,
		code: "BUSINESS_LOGIC_ERROR",
		timestamp: Date.now(),
		operation,
		entity,
		entityId,
		context,
	};
}

export function createUnknownError(
	message: string,
	originalError?: unknown,
	context?: Record<string, unknown>,
): UnknownError {
	return {
		message,
		code: "UNKNOWN_ERROR",
		timestamp: Date.now(),
		originalError,
		context,
	};
}

// error type guards
export function isValidationError(error: AppError): error is ValidationError {
	return error.code === "VALIDATION_ERROR";
}

export function isDatabaseError(error: AppError): error is DatabaseError {
	return error.code === "DATABASE_ERROR";
}

export function isAuthenticationError(
	error: AppError,
): error is AuthenticationError {
	return error.code === "AUTHENTICATION_ERROR";
}

export function isNetworkError(error: AppError): error is NetworkError {
	return error.code === "NETWORK_ERROR";
}

export function isBusinessLogicError(
	error: AppError,
): error is BusinessLogicError {
	return error.code === "BUSINESS_LOGIC_ERROR";
}

export function isUnknownError(error: AppError): error is UnknownError {
	return error.code === "UNKNOWN_ERROR";
}

// error conversion utilities
export function convertToAppError(error: unknown): AppError {
	if (error instanceof Error) {
		// handle Zod validation errors
		if (error.name === "ZodError" && "errors" in error) {
			const zodError = error as z.ZodError;
			const firstError = zodError.errors[0];
			return createValidationError(
				firstError?.message || "Validation failed",
				firstError?.path?.join("."),
				undefined,
				"ZodSchema",
				{ errors: zodError.errors },
			);
		}

		// handle other known error types
		if (
			error.message.includes("database") ||
			error.message.includes("mongodb")
		) {
			return createDatabaseError(
				error.message,
				"READ", // default operation
				undefined,
				undefined,
				{ originalError: error },
			);
		}

		if (error.message.includes("auth") || error.message.includes("token")) {
			return createAuthenticationError(
				error.message,
				"INVALID_CREDENTIALS",
				undefined,
				{ originalError: error },
			);
		}

		if (error.message.includes("network") || error.message.includes("fetch")) {
			return createNetworkError(
				error.message,
				undefined,
				undefined,
				undefined,
				{ originalError: error },
			);
		}

		// fallback to unknown error
		return createUnknownError(error.message, error);
	}

	// handle non-Error objects
	if (typeof error === "string") {
		return createUnknownError(error);
	}

	if (typeof error === "object" && error !== null) {
		const errorObj = error as Record<string, unknown>;
		return createUnknownError(
			(errorObj.message as string) || "Unknown error occurred",
			error,
		);
	}

	return createUnknownError("Unknown error occurred", error);
}

// safe error handling utilities
export function safeExecute<T>(
	operation: () => T,
	errorHandler?: (error: AppError) => void,
): { success: true; data: T } | { success: false; error: AppError } {
	try {
		const data = operation();
		return { success: true, data };
	} catch (error) {
		const appError = convertToAppError(error);
		errorHandler?.(appError);
		return { success: false, error: appError };
	}
}

export async function safeExecuteAsync<T>(
	operation: () => Promise<T>,
	errorHandler?: (error: AppError) => void,
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
	try {
		const data = await operation();
		return { success: true, data };
	} catch (error) {
		const appError = convertToAppError(error);
		errorHandler?.(appError);
		return { success: false, error: appError };
	}
}

// error logging utilities
export interface ErrorLogger {
	log(error: AppError): void;
	logError(error: unknown): void;
}

export class ConsoleErrorLogger implements ErrorLogger {
	log(error: AppError): void {
		console.error(`[${error.code}] ${error.message}`, {
			timestamp: new Date(error.timestamp).toISOString(),
			context: error.context,
		});
	}

	logError(error: unknown): void {
		const appError = convertToAppError(error);
		this.log(appError);
	}
}

export class SilentErrorLogger implements ErrorLogger {
	log(): void {
		// silent logger for production or testing
	}

	logError(): void {
		// silent logger for production or testing
	}
}

// error recovery utilities
export function canRetry(error: AppError): boolean {
	if (isNetworkError(error)) {
		// retry network errors with 5xx status codes
		return error.statusCode !== undefined && error.statusCode >= 500;
	}

	if (isDatabaseError(error)) {
		// retry database connection errors
		return (
			error.message.includes("connection") || error.message.includes("timeout")
		);
	}

	// don't retry validation, authentication, or business logic errors
	return false;
}

export function getRetryDelay(error: AppError, attempt: number): number {
	const baseDelay = 1000; // 1 second
	const maxDelay = 30000; // 30 seconds

	if (isNetworkError(error)) {
		// exponential backoff for network errors
		return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
	}

	if (isDatabaseError(error)) {
		// linear backoff for database errors
		return Math.min(baseDelay * attempt, maxDelay);
	}

	return baseDelay;
}

// error result types
export interface ErrorResult {
	success: false;
	error: AppError;
	data?: never;
}

export interface SuccessResult<T> {
	success: true;
	data: T;
	error?: never;
}

export type Result<T> = SuccessResult<T> | ErrorResult;

// result utilities
export function createSuccessResult<T>(data: T): SuccessResult<T> {
	return { success: true, data };
}

export function createErrorResult(error: AppError): ErrorResult {
	return { success: false, error };
}

export function isSuccessResult<T>(
	result: Result<T>,
): result is SuccessResult<T> {
	return result.success === true;
}

export function isErrorResult<T>(result: Result<T>): result is ErrorResult {
	return result.success === false;
}

// error boundary utilities for React
export interface ErrorBoundaryState {
	hasError: boolean;
	error: AppError | null;
}

export interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: (error: AppError) => React.ReactNode;
	onError?: (error: AppError) => void;
}

// error message utilities
export function getErrorMessage(error: AppError): string {
	switch (error.code) {
		case "VALIDATION_ERROR":
			return error.field
				? `Validation error in ${error.field}: ${error.message}`
				: error.message;

		case "DATABASE_ERROR":
			return `Database error during ${error.operation.toLowerCase()}: ${error.message}`;

		case "AUTHENTICATION_ERROR":
			return `Authentication error: ${error.message}`;

		case "NETWORK_ERROR":
			return error.statusCode
				? `Network error (${error.statusCode}): ${error.message}`
				: error.message;

		case "BUSINESS_LOGIC_ERROR":
			return error.entity
				? `Business logic error in ${error.entity}: ${error.message}`
				: error.message;

		case "UNKNOWN_ERROR":
		default:
			return error.message;
	}
}

export function getErrorTitle(error: AppError): string {
	switch (error.code) {
		case "VALIDATION_ERROR":
			return "Validation Error";
		case "DATABASE_ERROR":
			return "Database Error";
		case "AUTHENTICATION_ERROR":
			return "Authentication Error";
		case "NETWORK_ERROR":
			return "Network Error";
		case "BUSINESS_LOGIC_ERROR":
			return "Business Logic Error";
		case "UNKNOWN_ERROR":
		default:
			return "Error";
	}
}

// error aggregation utilities
export interface ErrorAggregator {
	addError(error: AppError): void;
	getErrors(): AppError[];
	clearErrors(): void;
	hasErrors(): boolean;
	getErrorsByCode(code: AppError["code"]): AppError[];
}

export class SimpleErrorAggregator implements ErrorAggregator {
	private errors: AppError[] = [];

	addError(error: AppError): void {
		this.errors.push(error);
	}

	getErrors(): AppError[] {
		return [...this.errors];
	}

	clearErrors(): void {
		this.errors = [];
	}

	hasErrors(): boolean {
		return this.errors.length > 0;
	}

	getErrorsByCode(code: AppError["code"]): AppError[] {
		return this.errors.filter((error) => error.code === code);
	}
}

// error validation schemas
export const BaseErrorSchema = z.object({
	message: z.string(),
	code: z.string(),
	timestamp: z.number(),
	context: z.record(z.unknown()).optional(),
});

export const ValidationErrorSchema = BaseErrorSchema.extend({
	code: z.literal("VALIDATION_ERROR"),
	field: z.string().optional(),
	value: z.unknown().optional(),
	schema: z.string().optional(),
});

export const DatabaseErrorSchema = BaseErrorSchema.extend({
	code: z.literal("DATABASE_ERROR"),
	operation: z.enum(["CREATE", "READ", "UPDATE", "DELETE"]),
	collection: z.string().optional(),
	documentId: z.string().optional(),
});

export const AuthenticationErrorSchema = BaseErrorSchema.extend({
	code: z.literal("AUTHENTICATION_ERROR"),
	reason: z.enum([
		"INVALID_CREDENTIALS",
		"TOKEN_EXPIRED",
		"INSUFFICIENT_PERMISSIONS",
		"ACCOUNT_LOCKED",
	]),
	userId: z.string().optional(),
});

export const NetworkErrorSchema = BaseErrorSchema.extend({
	code: z.literal("NETWORK_ERROR"),
	url: z.string().optional(),
	statusCode: z.number().optional(),
	method: z.string().optional(),
});

export const BusinessLogicErrorSchema = BaseErrorSchema.extend({
	code: z.literal("BUSINESS_LOGIC_ERROR"),
	operation: z.string(),
	entity: z.string().optional(),
	entityId: z.string().optional(),
});

export const UnknownErrorSchema = BaseErrorSchema.extend({
	code: z.literal("UNKNOWN_ERROR"),
	originalError: z.unknown().optional(),
});

export const AppErrorSchema = z.discriminatedUnion("code", [
	ValidationErrorSchema,
	DatabaseErrorSchema,
	AuthenticationErrorSchema,
	NetworkErrorSchema,
	BusinessLogicErrorSchema,
	UnknownErrorSchema,
]);

// error validation utilities
export function validateError(error: unknown): AppError {
	try {
		return AppErrorSchema.parse(error);
	} catch {
		return convertToAppError(error);
	}
}

export function safeValidateError(error: unknown): AppError | null {
	try {
		return AppErrorSchema.parse(error);
	} catch {
		return null;
	}
}
