"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

import {
	ConsolidatedBillDocumentSchema,
	ConsolidatedBillInsertSchema,
	TenantDocumentSchema,
	TenantInsertSchema,
	UtilityProviderDocumentSchema,
	UtilityProviderInsertSchema,
	UtilityProvidersArraySchema,
} from "@/lib/common/database-schemas";
import {
	createDatabaseError,
	createValidationError,
	safeExecuteAsync,
} from "@/lib/common/error-handling";
import {
	isObjectType,
	safeGetProperty,
	validateWithSchema,
} from "@/lib/common/type-utils";
import { roundToCurrency } from "@/lib/common/utils";
import { authOptions } from "@/lib/server/auth";
import client from "@/lib/server/mongodb";
import {
	ConsolidatedBill,
	Tenant,
	TenantFormData,
	User,
	UtilityProvider,
	UtilityProviderCategory,
} from "@/types";

export const isTokenExpired = async (tokenExp: number) => {
	return tokenExp < Math.floor(Date.now() / 1000);
};

export const getUser = async () => {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/");
	}
	if (!session.user) {
		redirect("/");
	}
	if (
		session.accessTokenExp &&
		(await isTokenExpired(session.accessTokenExp))
	) {
		redirect("/");
	}
	return {
		id: session.providerAccountId ?? "",
		name: session.user.name ?? "",
		email: session.user.email ?? "",
		accessToken: session.accessToken ?? "",
		accessTokenExp: session.accessTokenExp ?? 0,
	} as User;
};

export const getUtilityProviders = async (userId: string) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const collection = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.find({ user_id: userId })
			.toArray();

		// Validate each provider document
		const validatedProviders = collection.map((provider: unknown) => {
			const validation = validateWithSchema(
				UtilityProviderDocumentSchema,
				provider,
			);
			if (!validation.success) {
				const providerId = isObjectType(provider)
					? safeGetProperty(provider, "_id")?.toString()
					: undefined;
				throw createDatabaseError(
					`Invalid provider data: ${validation.error}`,
					"READ",
					"utility_providers",
					providerId,
				);
			}
			return validation.data;
		});

		// Validate array
		const arrayValidation = validateWithSchema(
			UtilityProvidersArraySchema,
			validatedProviders,
		);
		if (!arrayValidation.success) {
			throw createDatabaseError(
				`Invalid providers array: ${arrayValidation.error}`,
				"READ",
				"utility_providers",
			);
		}

		// Transform to application format
		return arrayValidation.data.map((provider) => ({
			id: provider._id.toString(),
			userId: provider.user_id,
			name: provider.name,
			category: provider.category as UtilityProviderCategory,
		})) as UtilityProvider[];
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const addUtilityProvider = async (
	userId: string,
	provider: UtilityProvider,
) => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const providerData = {
			user_id: userId,
			name: provider.name,
			category: provider.category,
		};

		const validation = validateWithSchema(
			UtilityProviderInsertSchema,
			providerData,
		);
		if (!validation.success) {
			throw createValidationError(
				`Invalid provider data: ${validation.error}`,
				"provider",
				providerData,
				"UtilityProviderInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const existingProvider = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.findOne({ user_id: userId, name: provider.name });

		if (existingProvider) {
			throw createDatabaseError(
				`Utility provider "${provider.name}" already exists.`,
				"CREATE",
				"utility_providers",
			);
		}

		const result = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.insertOne(validation.data);

		revalidatePath("/dashboard/providers");
		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
			insertedName: provider.name,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const deleteUtilityProvider = async (
	userId: string,
	providerId: string,
) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.deleteOne({
				_id: new ObjectId(providerId),
				user_id: userId,
			});

		if (result.deletedCount === 0) {
			throw createDatabaseError(
				"Utility provider not found or does not belong to user.",
				"DELETE",
				"utility_providers",
				providerId,
			);
		}

		revalidatePath("/dashboard/providers");
		return {
			acknowledged: result.acknowledged,
			deletedCount: result.deletedCount,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const updateUtilityProvider = async (
	userId: string,
	providerId: string,
	provider: UtilityProvider,
) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.updateOne(
				{ _id: new ObjectId(providerId), user_id: userId },
				{ $set: { name: provider.name, category: provider.category } },
			);

		if (result.matchedCount === 0) {
			throw createDatabaseError(
				"Utility provider not found or does not belong to user.",
				"UPDATE",
				"utility_providers",
				providerId,
			);
		}

		revalidatePath("/dashboard/providers");
		return {
			acknowledged: result.acknowledged,
			modifiedCount: result.modifiedCount,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const getTenants = async (userId: string): Promise<Tenant[]> => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const collection = await db
			.collection(process.env.MONGODB_TENANTS!)
			.find({ user_id: userId })
			.toArray();

		// Process each tenant document with safe validation
		const validatedTenants = collection
			.map((tenant: unknown) => {
				// First try to validate with the strict schema
				const validation = validateWithSchema(TenantDocumentSchema, tenant);

				if (validation.success) {
					return validation.data;
				}

				// If strict validation fails, try to normalize the data for existing records
				if (isObjectType(tenant)) {
					const normalizedTenant = {
						_id: safeGetProperty(tenant, "_id"),
						user_id: safeGetProperty(tenant, "user_id") || userId,
						name: safeGetProperty(tenant, "name") || "",
						email: safeGetProperty(tenant, "email") || "",
						secondary_name: safeGetProperty(tenant, "secondary_name") || null,
						shares: safeGetProperty(tenant, "shares") || {},
						outstanding_balance:
							safeGetProperty(tenant, "outstanding_balance") || 0,
						created_at: safeGetProperty(tenant, "created_at"),
						updated_at: safeGetProperty(tenant, "updated_at"),
					};

					// Try validation with normalized data
					const normalizedValidation = validateWithSchema(
						TenantDocumentSchema,
						normalizedTenant,
					);

					if (normalizedValidation.success) {
						return normalizedValidation.data;
					}
				}

				// If all validation fails, log the error and skip this record
				const tenantId = isObjectType(tenant)
					? safeGetProperty(tenant, "_id")?.toString()
					: undefined;
				console.warn(
					`Skipping invalid tenant document: ${tenantId}`,
					validation.error,
				);
				return null;
			})
			.filter(Boolean); // Remove null entries

		// Transform to application format
		return validatedTenants
			.map((tenant) => {
				if (!tenant) return null;
				return {
					id: tenant._id.toString(),
					userId: tenant.user_id,
					name: tenant.name,
					email: tenant.email,
					secondaryName: tenant.secondary_name ?? undefined,
					shares: tenant.shares,
					outstandingBalance: tenant.outstanding_balance,
				};
			})
			.filter(Boolean) as Tenant[];
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const addTenant = async (
	userId: string,
	tenant: TenantFormData,
): Promise<{ acknowledged: boolean; insertedId: string }> => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const tenantData = {
			user_id: userId,
			name: tenant.name,
			email: tenant.email,
			secondary_name: tenant.secondaryName ?? null,
			shares: tenant.shares,
			outstanding_balance: 0,
		};

		const validation = validateWithSchema(TenantInsertSchema, tenantData);
		if (!validation.success) {
			throw createValidationError(
				`Invalid tenant data: ${validation.error}`,
				"tenant",
				tenantData,
				"TenantInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_TENANTS!)
			.insertOne(validation.data);

		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const deleteTenant = async (userId: string, tenantId: string) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db.collection(process.env.MONGODB_TENANTS!).deleteOne({
			_id: new ObjectId(tenantId),
			user_id: userId,
		});

		if (result.deletedCount === 0) {
			throw createDatabaseError(
				"Tenant not found or does not belong to user.",
				"DELETE",
				"tenants",
				tenantId,
			);
		}

		revalidatePath("/dashboard/tenants");
		return {
			acknowledged: result.acknowledged,
			deletedCount: result.deletedCount,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const updateTenant = async (
	userId: string,
	tenantId: string,
	updatedTenant: TenantFormData,
): Promise<{ acknowledged: boolean }> => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db.collection(process.env.MONGODB_TENANTS!).updateOne(
			{ _id: new ObjectId(tenantId), user_id: userId },
			{
				$set: {
					name: updatedTenant.name,
					email: updatedTenant.email,
					secondary_name: updatedTenant.secondaryName ?? null,
					shares: updatedTenant.shares,
				},
			},
		);

		return { acknowledged: result.acknowledged };
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const updateTenantBalance = async (
	userId: string,
	tenantId: string,
	balance: number = 0,
) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_TENANTS!)
			.updateOne(
				{ _id: new ObjectId(tenantId), user_id: userId },
				{ $set: { outstanding_balance: roundToCurrency(balance) } },
			);

		if (result.matchedCount === 0) {
			throw createDatabaseError(
				"Tenant not found or does not belong to user.",
				"UPDATE",
				"tenants",
				tenantId,
			);
		}

		revalidatePath("/dashboard");
		return {
			acknowledged: result.acknowledged,
			modifiedCount: result.modifiedCount,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const markBillAsPaid = async (
	userId: string,
	billId: string,
	paymentMessageId: string,
) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.updateOne(
				{ _id: new ObjectId(billId), user_id: userId },
				{
					$set: {
						paid: true,
						date_paid: new Date().toISOString(),
						payment_message_id: paymentMessageId,
					},
				},
			);

		if (result.matchedCount === 0) {
			throw createDatabaseError(
				"Bill not found or does not belong to user.",
				"UPDATE",
				"consolidated_bills",
				billId,
			);
		}

		revalidatePath("/dashboard");
		return {
			acknowledged: result.acknowledged,
			modifiedCount: result.modifiedCount,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const getConsolidatedBills = async (
	userId: string,
	date?: { year: number; month: number },
) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const query: { user_id: string; year?: number; month?: number } = {
			user_id: userId,
		};
		if (date) {
			query.year = date.year;
			query.month = date.month;
		}
		const collection = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.find(query)
			.sort({ year: -1, month: -1 })
			.toArray();

		// Process each bill document with safe validation
		const validatedBills = collection
			.map((bill: unknown) => {
				// First try to validate with the strict schema
				const validation = validateWithSchema(
					ConsolidatedBillDocumentSchema,
					bill,
				);

				if (validation.success) {
					return validation.data;
				}

				// If strict validation fails, try to normalize the data for existing records
				if (isObjectType(bill)) {
					const normalizedBill = {
						_id: safeGetProperty(bill, "_id"),
						user_id: safeGetProperty(bill, "user_id") || userId,
						year: safeGetProperty(bill, "year") || new Date().getFullYear(),
						month: safeGetProperty(bill, "month") || new Date().getMonth() + 1,
						tenant_id: safeGetProperty(bill, "tenant_id") || null,
						categories: safeGetProperty(bill, "categories") || {},
						total_amount: safeGetProperty(bill, "total_amount") || 0,
						paid: safeGetProperty(bill, "paid") || false,
						date_sent: safeGetProperty(bill, "date_sent") || null,
						date_paid: safeGetProperty(bill, "date_paid") || null,
						payment_message_id: safeGetProperty(bill, "payment_message_id"),
						created_at: safeGetProperty(bill, "created_at"),
						updated_at: safeGetProperty(bill, "updated_at"),
					};

					// Try validation with normalized data
					const normalizedValidation = validateWithSchema(
						ConsolidatedBillDocumentSchema,
						normalizedBill,
					);

					if (normalizedValidation.success) {
						return normalizedValidation.data;
					}
				}

				// If all validation fails, log the error and skip this record
				const billId = isObjectType(bill)
					? safeGetProperty(bill, "_id")?.toString()
					: undefined;
				console.warn(
					`Skipping invalid bill document: ${billId}`,
					validation.error,
				);
				return null;
			})
			.filter(Boolean); // Remove null entries

		// Transform to application format
		return validatedBills
			.map((bill) => {
				if (!bill) return null;
				return {
					id: bill._id.toString(),
					userId: bill.user_id,
					month: bill.month,
					year: bill.year,
					tenantId: bill.tenant_id,
					categories: Object.fromEntries(
						Object.entries(bill.categories).map(([key, value]) => {
							const categoryValue = value as {
								gmail_message_id: string;
								provider_id: string;
								provider_name: string;
								amount: number;
							};
							return [
								key,
								{
									gmailMessageId: categoryValue.gmail_message_id,
									providerId: categoryValue.provider_id,
									providerName: categoryValue.provider_name,
									amount: categoryValue.amount,
								},
							];
						}),
					),
					totalAmount: bill.total_amount,
					paid: bill.paid,
					dateSent: bill.date_sent
						? new Date(bill.date_sent).toDateString()
						: null,
					datePaid: bill.date_paid
						? new Date(bill.date_paid).toDateString()
						: null,
				};
			})
			.filter(Boolean) as ConsolidatedBill[];
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};

export const addConsolidatedBill = async (
	userId: string,
	bill: ConsolidatedBill,
) => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const billData = {
			user_id: userId,
			year: bill.year,
			month: bill.month,
			tenant_id: bill.tenantId,
			categories: bill.categories,
			total_amount: roundToCurrency(bill.totalAmount),
			paid: bill.paid,
			date_sent: bill.dateSent,
			date_paid: bill.datePaid,
		};

		const validation = validateWithSchema(
			ConsolidatedBillInsertSchema,
			billData,
		);
		if (!validation.success) {
			throw createValidationError(
				`Invalid bill data: ${validation.error}`,
				"bill",
				billData,
				"ConsolidatedBillInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const existingBill = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.findOne({
				user_id: userId,
				year: bill.year,
				month: bill.month,
			});

		if (existingBill) {
			throw createDatabaseError(
				`Consolidated bill for ${bill.month}/${bill.year} already exists.`,
				"CREATE",
				"consolidated_bills",
			);
		}

		const result = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.insertOne(validation.data);

		revalidatePath("/dashboard/bills");
		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
