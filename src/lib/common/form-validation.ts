import { FieldError, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// base form validation schemas
export const FormEmailSchema = z
	.string()
	.email("Please enter a valid email address");
export const PasswordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters");
export const NameSchema = z
	.string()
	.min(1, "Name is required")
	.max(100, "Name is too long");
export const PhoneSchema = z
	.string()
	.regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number");
export const FormUrlSchema = z
	.string()
	.url("Please enter a valid URL")
	.optional();

// utility provider form schemas
export const UtilityProviderFormSchema = z.object({
	name: NameSchema,
	category: z.enum(["Water", "Gas", "Electricity", "Internet", "OTHER"], {
		required_error: "Please select a category",
	}),
	email: FormEmailSchema,
	website: FormUrlSchema,
});

// tenant form schemas
export const TenantFormValidationSchema = z.object({
	name: NameSchema,
	email: FormEmailSchema,
	secondaryName: z.string().optional(),
	shares: z
		.object({
			Water: z.number().min(0).max(100),
			Gas: z.number().min(0).max(100),
			Electricity: z.number().min(0).max(100),
			Internet: z.number().min(0).max(100),
			OTHER: z.number().min(0).max(100),
		})
		.refine(
			(shares) => {
				const total = Object.values(shares).reduce(
					(sum, share) => sum + share,
					0,
				);
				return total <= 100;
			},
			{
				message: "Total shares cannot exceed 100%",
				path: ["shares"],
			},
		),
});

// bill form schemas
export const BillFormSchema = z.object({
	gmailMessageId: z.string().min(1, "Gmail message ID is required"),
	utilityProviderId: z.string().min(1, "Utility provider is required"),
	amount: z.number().positive("Amount must be positive"),
	month: z.number().min(1).max(12, "Month must be between 1 and 12"),
	year: z.number().min(2020).max(2030, "Year must be between 2020 and 2030"),
});

// consolidated bill form schemas
export const ConsolidatedBillFormSchema = z.object({
	year: z.number().min(2020).max(2030, "Year must be between 2020 and 2030"),
	month: z.number().min(1).max(12, "Month must be between 1 and 12"),
	tenantId: z.string().optional(),
	categories: z.record(
		z.object({
			gmailMessageId: z.string().min(1, "Gmail message ID is required"),
			providerId: z.string().min(1, "Provider ID is required"),
			providerName: z.string().min(1, "Provider name is required"),
			amount: z.number().positive("Amount must be positive"),
		}),
	),
	totalAmount: z.number().positive("Total amount must be positive"),
	paid: z.boolean().default(false),
	dateSent: z.string().optional(),
	datePaid: z.string().optional(),
});

// type exports for form schemas
export type UtilityProviderFormData = z.infer<typeof UtilityProviderFormSchema>;
export type TenantFormData = z.infer<typeof TenantFormValidationSchema>;
export type BillFormData = z.infer<typeof BillFormSchema>;
export type ConsolidatedBillFormData = z.infer<
	typeof ConsolidatedBillFormSchema
>;

// type-safe form field error type
export type FormFieldError = FieldError | undefined;

// type-safe form validation result
export interface FormValidationResult<T> {
	isValid: boolean;
	data?: T;
	errors?: Record<string, string>;
}

// validation functions
export function validateFormData<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): FormValidationResult<T> {
	try {
		const validatedData = schema.parse(data);
		return {
			isValid: true,
			data: validatedData,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors: Record<string, string> = {};
			error.errors.forEach((err) => {
				const path = err.path.join(".");
				errors[path] = err.message;
			});
			return {
				isValid: false,
				errors,
			};
		}
		return {
			isValid: false,
			errors: { general: "Validation failed" },
		};
	}
}

// safe validation function that returns null on failure
export function safeValidateFormData<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): T | null {
	try {
		return schema.parse(data);
	} catch {
		return null;
	}
}

// form field validation helpers
export function validateFormEmail(email: string): boolean {
	return FormEmailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
	return PasswordSchema.safeParse(password).success;
}

export function validateName(name: string): boolean {
	return NameSchema.safeParse(name).success;
}

export function validatePhone(phone: string): boolean {
	return PhoneSchema.safeParse(phone).success;
}

export function validateFormUrl(url: string): boolean {
	return FormUrlSchema.safeParse(url).success;
}

// form error message helpers
export function getFieldErrorMessage(
	errors: Record<string, string>,
	fieldName: string,
): string | undefined {
	return errors[fieldName];
}

export function hasFieldError(
	errors: Record<string, string>,
	fieldName: string,
): boolean {
	return fieldName in errors;
}

// form submission helpers
export async function handleFormSubmission<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
	onSuccess: (data: T) => void | Promise<void>,
	onError: (errors: Record<string, string>) => void,
): Promise<void> {
	const result = validateFormData(schema, data);

	if (result.isValid && result.data) {
		try {
			await onSuccess(result.data);
		} catch {
			onError({ general: "Submission failed" });
		}
	} else if (result.errors) {
		onError(result.errors);
	}
}

// form reset helpers
export function createFormResetHandler<T extends FieldValues>(
	form: UseFormReturn<T>,
	defaultValues?: Partial<T>,
) {
	return () => {
		form.reset(defaultValues as T);
		form.clearErrors();
	};
}

// form state helpers
export function isFormValid<T extends FieldValues>(
	form: UseFormReturn<T>,
): boolean {
	return form.formState.isValid;
}

export function isFormDirty<T extends FieldValues>(
	form: UseFormReturn<T>,
): boolean {
	return form.formState.isDirty;
}

export function isFormSubmitting<T extends FieldValues>(
	form: UseFormReturn<T>,
): boolean {
	return form.formState.isSubmitting;
}

// form field helpers
export function getFieldValue<T extends FieldValues, K extends Path<T>>(
	form: UseFormReturn<T>,
	fieldName: K,
): T[K] {
	return form.getValues(fieldName);
}

export function setFieldValue<T extends FieldValues, K extends Path<T>>(
	form: UseFormReturn<T>,
	fieldName: K,
	value: T[K],
): void {
	form.setValue(fieldName, value, { shouldValidate: true });
}

export function clearFieldError<T extends FieldValues, K extends Path<T>>(
	form: UseFormReturn<T>,
	fieldName: K,
): void {
	form.clearErrors(fieldName);
}

// form validation patterns
export const ValidationPatterns = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	phone: /^\+?[\d\s\-\(\)]+$/,
	url: /^https?:\/\/.+/,
	password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// form validation messages
export const ValidationMessages = {
	required: "This field is required",
	email: "Please enter a valid email address",
	phone: "Please enter a valid phone number",
	url: "Please enter a valid URL",
	password:
		"Password must be at least 8 characters with uppercase, lowercase, and number",
	minLength: (min: number) => `Must be at least ${min} characters`,
	maxLength: (max: number) => `Must be no more than ${max} characters`,
	min: (min: number) => `Must be at least ${min}`,
	max: (max: number) => `Must be no more than ${max}`,
	positive: "Must be a positive number",
	percentage: "Must be between 0 and 100",
} as const;
