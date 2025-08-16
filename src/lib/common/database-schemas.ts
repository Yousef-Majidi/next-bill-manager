import { ObjectId } from "mongodb";
import { z } from "zod";

// base schemas for common fields
export const ObjectIdSchema = z
	.string()
	.refine((val) => ObjectId.isValid(val), {
		message: "Invalid ObjectId format",
	});

export const EmailSchema = z.string().email("Invalid email format");
export const NonEmptyStringSchema = z.string().min(1, "String cannot be empty");
export const PositiveNumberSchema = z
	.number()
	.positive("Number must be positive");
export const NonNegativeNumberSchema = z
	.number()
	.nonnegative("Number must be non-negative");
export const DateStringSchema = z.string().datetime("Invalid date format");

// utility provider category enum
export const UtilityProviderCategorySchema = z.enum([
	"Water",
	"Gas",
	"Electricity",
	"Internet",
	"OTHER",
]);

// database document schemas (raw database format)
export const UtilityProviderDocumentSchema = z.object({
	_id: z.instanceof(ObjectId),
	user_id: NonEmptyStringSchema,
	name: NonEmptyStringSchema,
	category: UtilityProviderCategorySchema,
	email: EmailSchema.optional(),
	website: z.string().url("Invalid URL format").optional(),
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const TenantDocumentSchema = z.object({
	_id: z.instanceof(ObjectId),
	user_id: NonEmptyStringSchema,
	name: NonEmptyStringSchema,
	email: EmailSchema,
	secondary_name: z.string().nullable(),
	shares: z.record(UtilityProviderCategorySchema, z.number().min(0).max(100)),
	outstanding_balance: NonNegativeNumberSchema,
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const ConsolidatedBillDocumentSchema = z.object({
	_id: z.instanceof(ObjectId),
	user_id: NonEmptyStringSchema,
	year: z.number().min(2020).max(2030),
	month: z.number().min(1).max(12),
	tenant_id: ObjectIdSchema.nullable(),
	categories: z.record(
		UtilityProviderCategorySchema,
		z.object({
			gmail_message_id: NonEmptyStringSchema,
			provider_id: ObjectIdSchema,
			provider_name: NonEmptyStringSchema,
			amount: PositiveNumberSchema,
		}),
	),
	total_amount: PositiveNumberSchema,
	paid: z.boolean(),
	date_sent: DateStringSchema.nullable(),
	date_paid: DateStringSchema.nullable(),
	payment_message_id: NonEmptyStringSchema.optional(),
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const UtilityBillDocumentSchema = z.object({
	_id: z.instanceof(ObjectId),
	user_id: NonEmptyStringSchema,
	gmail_message_id: NonEmptyStringSchema,
	utility_provider_id: ObjectIdSchema,
	amount: PositiveNumberSchema,
	month: z.number().min(1).max(12),
	year: z.number().min(2020).max(2030),
	processed: z.boolean().default(false),
	created_at: DateStringSchema.optional(),
});

// query schemas for database operations
export const UserIdQuerySchema = z.object({
	user_id: NonEmptyStringSchema,
});

export const TenantQuerySchema = UserIdQuerySchema.extend({
	_id: ObjectIdSchema.optional(),
});

export const ProviderQuerySchema = UserIdQuerySchema.extend({
	_id: ObjectIdSchema.optional(),
	name: NonEmptyStringSchema.optional(),
});

export const ConsolidatedBillQuerySchema = UserIdQuerySchema.extend({
	year: z.number().min(2020).max(2030).optional(),
	month: z.number().min(1).max(12).optional(),
	_id: ObjectIdSchema.optional(),
});

// insert schemas for creating new documents
export const UtilityProviderInsertSchema = z.object({
	user_id: NonEmptyStringSchema,
	name: NonEmptyStringSchema,
	category: UtilityProviderCategorySchema,
	email: EmailSchema.optional(),
	website: z.string().url("Invalid URL format").optional(),
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const TenantInsertSchema = z.object({
	user_id: NonEmptyStringSchema,
	name: NonEmptyStringSchema,
	email: EmailSchema,
	secondary_name: z.string().nullable(),
	shares: z.record(UtilityProviderCategorySchema, z.number().min(0).max(100)),
	outstanding_balance: NonNegativeNumberSchema.default(0),
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const ConsolidatedBillInsertSchema = z.object({
	user_id: NonEmptyStringSchema,
	year: z.number().min(2020).max(2030),
	month: z.number().min(1).max(12),
	tenant_id: ObjectIdSchema.nullable(),
	categories: z.record(
		UtilityProviderCategorySchema,
		z.object({
			gmail_message_id: NonEmptyStringSchema,
			provider_id: ObjectIdSchema,
			provider_name: NonEmptyStringSchema,
			amount: PositiveNumberSchema,
		}),
	),
	total_amount: PositiveNumberSchema,
	paid: z.boolean().default(false),
	date_sent: DateStringSchema.nullable(),
	date_paid: DateStringSchema.nullable(),
	payment_message_id: NonEmptyStringSchema.optional(),
	created_at: DateStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

// update schemas for modifying documents
export const UtilityProviderUpdateSchema = z.object({
	name: NonEmptyStringSchema.optional(),
	category: UtilityProviderCategorySchema.optional(),
	email: EmailSchema.optional(),
	website: z.string().url("Invalid URL format").optional(),
	updated_at: DateStringSchema.optional(),
});

export const TenantDbUpdateSchema = z.object({
	name: NonEmptyStringSchema.optional(),
	email: EmailSchema.optional(),
	secondary_name: z.string().nullable().optional(),
	shares: z
		.record(UtilityProviderCategorySchema, z.number().min(0).max(100))
		.optional(),
	outstanding_balance: NonNegativeNumberSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

export const ConsolidatedBillDbUpdateSchema = z.object({
	tenant_id: ObjectIdSchema.nullable().optional(),
	categories: z
		.record(
			UtilityProviderCategorySchema,
			z.object({
				gmail_message_id: NonEmptyStringSchema,
				provider_id: ObjectIdSchema,
				provider_name: NonEmptyStringSchema,
				amount: PositiveNumberSchema,
			}),
		)
		.optional(),
	total_amount: PositiveNumberSchema.optional(),
	paid: z.boolean().optional(),
	date_sent: DateStringSchema.nullable().optional(),
	date_paid: DateStringSchema.nullable().optional(),
	payment_message_id: NonEmptyStringSchema.optional(),
	updated_at: DateStringSchema.optional(),
});

// type exports
export type UtilityProviderDocument = z.infer<
	typeof UtilityProviderDocumentSchema
>;
export type TenantDocument = z.infer<typeof TenantDocumentSchema>;
export type ConsolidatedBillDocument = z.infer<
	typeof ConsolidatedBillDocumentSchema
>;
export type UtilityBillDocument = z.infer<typeof UtilityBillDocumentSchema>;

export type UtilityProviderInsert = z.infer<typeof UtilityProviderInsertSchema>;
export type TenantInsert = z.infer<typeof TenantInsertSchema>;
export type ConsolidatedBillInsert = z.infer<
	typeof ConsolidatedBillInsertSchema
>;

export type UtilityProviderUpdate = z.infer<typeof UtilityProviderUpdateSchema>;
export type TenantDbUpdate = z.infer<typeof TenantDbUpdateSchema>;
export type ConsolidatedBillDbUpdate = z.infer<
	typeof ConsolidatedBillDbUpdateSchema
>;

// validation functions
export const validateUtilityProviderDocument = (
	data: unknown,
): UtilityProviderDocument => {
	return UtilityProviderDocumentSchema.parse(data);
};

export const validateTenantDocument = (data: unknown): TenantDocument => {
	return TenantDocumentSchema.parse(data);
};

export const validateConsolidatedBillDocument = (
	data: unknown,
): ConsolidatedBillDocument => {
	return ConsolidatedBillDocumentSchema.parse(data);
};

export const validateUtilityProviderInsert = (
	data: unknown,
): UtilityProviderInsert => {
	return UtilityProviderInsertSchema.parse(data);
};

export const validateTenantInsert = (data: unknown): TenantInsert => {
	return TenantInsertSchema.parse(data);
};

export const validateConsolidatedBillInsert = (
	data: unknown,
): ConsolidatedBillInsert => {
	return ConsolidatedBillInsertSchema.parse(data);
};

// safe validation functions that return null on failure
export const safeValidateUtilityProviderDocument = (
	data: unknown,
): UtilityProviderDocument | null => {
	try {
		return UtilityProviderDocumentSchema.parse(data);
	} catch {
		return null;
	}
};

export const safeValidateTenantDocument = (
	data: unknown,
): TenantDocument | null => {
	try {
		return TenantDocumentSchema.parse(data);
	} catch {
		return null;
	}
};

export const safeValidateConsolidatedBillDocument = (
	data: unknown,
): ConsolidatedBillDocument | null => {
	try {
		return ConsolidatedBillDocumentSchema.parse(data);
	} catch {
		return null;
	}
};

// database operation result schemas
export const DatabaseResultSchema = z.object({
	acknowledged: z.boolean(),
});

export const InsertResultSchema = DatabaseResultSchema.extend({
	insertedId: ObjectIdSchema,
});

export const UpdateResultSchema = DatabaseResultSchema.extend({
	matchedCount: z.number().nonnegative(),
	modifiedCount: z.number().nonnegative(),
});

export const DeleteResultSchema = DatabaseResultSchema.extend({
	deletedCount: z.number().nonnegative(),
});

export type DatabaseResult = z.infer<typeof DatabaseResultSchema>;
export type InsertResult = z.infer<typeof InsertResultSchema>;
export type UpdateResult = z.infer<typeof UpdateResultSchema>;
export type DeleteResult = z.infer<typeof DeleteResultSchema>;

// Array schemas for database operations
export const TenantsArraySchema = z.array(TenantDocumentSchema);
export const UtilityProvidersArraySchema = z.array(
	UtilityProviderDocumentSchema,
);
export const ConsolidatedBillsArraySchema = z.array(
	ConsolidatedBillDocumentSchema,
);
export const UtilityBillsArraySchema = z.array(UtilityBillDocumentSchema);

export type TenantsArray = z.infer<typeof TenantsArraySchema>;
export type UtilityProvidersArray = z.infer<typeof UtilityProvidersArraySchema>;
export type ConsolidatedBillsArray = z.infer<
	typeof ConsolidatedBillsArraySchema
>;
export type UtilityBillsArray = z.infer<typeof UtilityBillsArraySchema>;
