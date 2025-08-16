import { z } from "zod";

// base response types
export const BaseResponseSchema = z.object({
	success: z.boolean(),
	message: z.string().optional(),
});

export const ErrorResponseSchema = BaseResponseSchema.extend({
	success: z.literal(false),
	error: z.string(),
	code: z.string().optional(),
});

export const SuccessResponseSchema = BaseResponseSchema.extend({
	success: z.literal(true),
});

// discriminated union for API responses
export const ApiResponseSchema = z.discriminatedUnion("success", [
	SuccessResponseSchema,
	ErrorResponseSchema,
]);

// tenant-related contracts
export const TenantCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	secondaryName: z.string().optional(),
	shares: z.record(z.number().min(0).max(1)),
});

export const TenantUpdateSchema = TenantCreateSchema.partial();

export const TenantResponseSchema = SuccessResponseSchema.extend({
	data: z.object({
		id: z.string(),
		userId: z.string(),
		name: z.string(),
		email: z.string(),
		secondaryName: z.string().optional(),
		shares: z.record(z.number()),
		outstandingBalance: z.number(),
	}),
});

// provider-related contracts
export const ProviderCreateSchema = z.object({
	name: z.string().min(1, "Provider name is required"),
	category: z.enum(["ELECTRICITY", "WATER", "GAS", "INTERNET", "OTHER"]),
	email: z.string().email("Invalid email format"),
	website: z.string().url("Invalid URL format").optional(),
});

export const ProviderUpdateSchema = ProviderCreateSchema.partial();

export const ProviderResponseSchema = SuccessResponseSchema.extend({
	data: z.object({
		id: z.string(),
		userId: z.string(),
		name: z.string(),
		category: z.enum(["ELECTRICITY", "WATER", "GAS", "INTERNET", "OTHER"]),
		email: z.string(),
		website: z.string().optional(),
	}),
});

// bill-related contracts
export const BillCreateSchema = z.object({
	gmailMessageId: z.string(),
	utilityProviderId: z.string(),
	amount: z.number().positive("Amount must be positive"),
	month: z.number().min(1).max(12),
	year: z.number().min(2020),
});

export const BillResponseSchema = SuccessResponseSchema.extend({
	data: z.object({
		id: z.string().nullable(),
		gmailMessageId: z.string(),
		utilityProvider: z.object({
			id: z.string(),
			name: z.string(),
			category: z.enum(["ELECTRICITY", "WATER", "GAS", "INTERNET", "OTHER"]),
		}),
		amount: z.number(),
		month: z.number(),
		year: z.number(),
	}),
});

// consolidated bill contracts
export const ConsolidatedBillResponseSchema = SuccessResponseSchema.extend({
	data: z.object({
		id: z.string().nullable(),
		userId: z.string(),
		month: z.number(),
		year: z.number(),
		tenantId: z.string().nullable(),
		categories: z.record(
			z.object({
				gmailMessageId: z.string(),
				providerId: z.string(),
				providerName: z.string(),
				amount: z.number(),
			}),
		),
		totalAmount: z.number(),
		paid: z.boolean(),
		dateSent: z.string().nullable(),
		datePaid: z.string().nullable(),
	}),
});

// dashboard contracts
export const DashboardStatsSchema = z.object({
	totalBills: z.number(),
	totalAmount: z.number(),
	paidBills: z.number(),
	unpaidBills: z.number(),
	activeTenants: z.number(),
	activeProviders: z.number(),
});

export const DashboardResponseSchema = SuccessResponseSchema.extend({
	data: z.object({
		stats: DashboardStatsSchema,
		recentBills: z.array(BillResponseSchema.shape.data),
		consolidatedBills: z.array(ConsolidatedBillResponseSchema.shape.data),
	}),
});

// type exports
export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export type TenantCreate = z.infer<typeof TenantCreateSchema>;
export type TenantUpdate = z.infer<typeof TenantUpdateSchema>;
export type TenantResponse = z.infer<typeof TenantResponseSchema>;

export type ProviderCreate = z.infer<typeof ProviderCreateSchema>;
export type ProviderUpdate = z.infer<typeof ProviderUpdateSchema>;
export type ProviderResponse = z.infer<typeof ProviderResponseSchema>;

export type BillCreate = z.infer<typeof BillCreateSchema>;
export type BillResponse = z.infer<typeof BillResponseSchema>;

export type ConsolidatedBillResponse = z.infer<
	typeof ConsolidatedBillResponseSchema
>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

// utility functions for API responses
export const createSuccessResponse = <T>(
	data: T,
): SuccessResponse & { data: T } => ({
	success: true,
	data,
});

export const createErrorResponse = (
	error: string,
	code?: string,
): ErrorResponse => ({
	success: false,
	error,
	code,
});

// validation helpers
export const validateApiRequest = <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): T => {
	return schema.parse(data);
};

export const safeValidateApiRequest = <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): T | null => {
	try {
		return schema.parse(data);
	} catch {
		return null;
	}
};
