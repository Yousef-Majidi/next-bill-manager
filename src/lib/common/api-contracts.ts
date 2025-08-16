import { z } from "zod";

// Request schemas
export const CreateTenantRequestSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	secondaryName: z.string().optional(),
	shares: z.record(z.string(), z.number().min(0).max(100)),
});

export const UpdateTenantRequestSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	email: z.string().email("Invalid email format").optional(),
	secondaryName: z.string().optional(),
	shares: z.record(z.string(), z.number().min(0).max(100)).optional(),
});

export const CreateProviderRequestSchema = z.object({
	name: z.string().min(1, "Name is required"),
	category: z.enum(["Water", "Gas", "Electricity", "Internet", "OTHER"]),
	email: z.string().email("Invalid email format").optional(),
	website: z.string().url("Invalid URL format").optional(),
});

export const UpdateProviderRequestSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	category: z
		.enum(["Water", "Gas", "Electricity", "Internet", "OTHER"])
		.optional(),
	email: z.string().email("Invalid email format").optional(),
	website: z.string().url("Invalid URL format").optional(),
});

// Response schemas
export const TenantResponseSchema = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	secondaryName: z.string().optional(),
	shares: z.record(z.string(), z.number()),
	outstandingBalance: z.number(),
});

export const ProviderResponseSchema = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	category: z.enum(["Water", "Gas", "Electricity", "Internet", "OTHER"]),
	email: z.string().optional(),
	website: z.string().optional(),
});

export const BillResponseSchema = z.object({
	id: z.string(),
	userId: z.string(),
	month: z.number(),
	year: z.number(),
	tenantId: z.string().optional(),
	categories: z.record(
		z.string(),
		z.object({
			gmailMessageId: z.string(),
			providerId: z.string(),
			providerName: z.string(),
			amount: z.number(),
		}),
	),
	totalAmount: z.number(),
	paid: z.boolean(),
	dateSent: z.string().optional(),
	datePaid: z.string().optional(),
});

export const SuccessResponseSchema = z.object({
	success: z.literal(true),
	data: z.unknown(),
});

export const ErrorResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
	details: z.string().optional(),
	code: z.string().optional(),
});

// API contract types
export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequestSchema>;
export type CreateProviderRequest = z.infer<typeof CreateProviderRequestSchema>;
export type UpdateProviderRequest = z.infer<typeof UpdateProviderRequestSchema>;

export type TenantResponse = z.infer<typeof TenantResponseSchema>;
export type ProviderResponse = z.infer<typeof ProviderResponseSchema>;
export type BillResponse = z.infer<typeof BillResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Discriminated union for API responses
export type APIResponse<T> =
	| { success: true; data: T }
	| { success: false; error: ErrorResponse };

// Array response schemas
export const TenantsArraySchema = z.array(TenantResponseSchema);
export const ProvidersArraySchema = z.array(ProviderResponseSchema);
export const BillsArraySchema = z.array(BillResponseSchema);

export type TenantsArray = z.infer<typeof TenantsArraySchema>;
export type ProvidersArray = z.infer<typeof ProvidersArraySchema>;
export type BillsArray = z.infer<typeof BillsArraySchema>;
