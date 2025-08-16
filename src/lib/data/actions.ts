"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

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
	if (await isTokenExpired(session.accessTokenExp)) {
		redirect("/");
	}
	return {
		id: session.providerAccountId,
		name: session.user.name,
		email: session.user.email,
		accessToken: session.accessToken,
		accessTokenExp: session.accessTokenExp,
	} as User;
};

export const getUtilityProviders = async (userId: string) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const collection = await db
		.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
		.find({ user_id: userId })
		.toArray();
	return collection.map((provider) => ({
		id: provider._id.toString(),
		userId: provider.user_id,
		name: provider.name,
		category: provider.category as UtilityProviderCategory,
	})) as UtilityProvider[];
};

export const addUtilityProvider = async (
	userId: string,
	provider: UtilityProvider,
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const existingProvider = await db
		.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
		.findOne({ user_id: userId, name: provider.name });
	if (existingProvider) {
		throw new Error(`Utility provider "${provider.name}" already exists.`);
	}

	const result = await db
		.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
		.insertOne({
			user_id: userId,
			name: provider.name,
			category: provider.category,
		});
	revalidatePath("/dashboard/providers");
	return {
		acknowledged: result.acknowledged,
		insertedId: result.insertedId.toString(),
		insertedName: provider.name,
	};
};

export const deleteUtilityProvider = async (
	userId: string,
	providerId: string,
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const result = await db
		.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
		.deleteOne({
			_id: new ObjectId(providerId),
			user_id: userId,
		});
	if (result.deletedCount === 0) {
		throw new Error("Utility provider not found or does not belong to user.");
	}
	revalidatePath("/dashboard/providers");
	return {
		acknowledged: result.acknowledged,
		deletedCount: result.deletedCount,
	};
};

export const updateUtilityProvider = async (
	userId: string,
	providerId: string,
	provider: UtilityProvider,
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const result = await db
		.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
		.updateOne(
			{ _id: new ObjectId(providerId), user_id: userId },
			{ $set: { name: provider.name, category: provider.category } },
		);
	if (result.matchedCount === 0) {
		throw new Error("Utility provider not found or does not belong to user.");
	}
	revalidatePath("/dashboard/providers");
	return {
		acknowledged: result.acknowledged,
		modifiedCount: result.modifiedCount,
	};
};

export const getTenants = async (userId: string): Promise<Tenant[]> => {
	try {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const collection = await db
			.collection(process.env.MONGODB_TENANTS!)
			.find({ user_id: userId })
			.toArray();

		return collection.map((tenant) => ({
			id: tenant._id.toString(),
			userId: tenant.user_id,
			name: tenant.name,
			email: tenant.email,
			secondaryName: tenant.secondary_name ?? undefined,
			shares: tenant.shares,
			outstandingBalance: tenant.outstanding_balance,
		})) as Tenant[];
	} catch (error) {
		console.error("Error getting tenants:", error);
		throw new Error("Failed to get tenants");
	}
};

export const addTenant = async (
	userId: string,
	tenant: TenantFormData,
): Promise<{ acknowledged: boolean; insertedId: string }> => {
	try {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db.collection(process.env.MONGODB_TENANTS!).insertOne({
			user_id: userId,
			name: tenant.name,
			email: tenant.email,
			secondary_name: tenant.secondaryName ?? null,
			shares: tenant.shares,
			outstanding_balance: 0,
		});

		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
		};
	} catch (error) {
		console.error("Error adding tenant:", error);
		throw new Error("Failed to add tenant");
	}
};

export const deleteTenant = async (userId: string, tenantId: string) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const result = await db.collection(process.env.MONGODB_TENANTS!).deleteOne({
		_id: new ObjectId(tenantId),
		user_id: userId,
	});
	if (result.deletedCount === 0) {
		throw new Error("Tenant not found or does not belong to user.");
	}
	revalidatePath("/dashboard/tenants");
	return {
		acknowledged: result.acknowledged,
		deletedCount: result.deletedCount,
	};
};

export const updateTenant = async (
	userId: string,
	tenantId: string,
	updatedTenant: TenantFormData,
): Promise<{ acknowledged: boolean }> => {
	try {
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
	} catch (error) {
		console.error("Error updating tenant:", error);
		throw new Error("Failed to update tenant");
	}
};

export const updateTenantBalance = async (
	userId: string,
	tenantId: string,
	balance: number = 0,
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const result = await db
		.collection(process.env.MONGODB_TENANTS!)
		.updateOne(
			{ _id: new ObjectId(tenantId), user_id: userId },
			{ $set: { outstanding_balance: roundToCurrency(balance) } },
		);
	if (result.matchedCount === 0) {
		throw new Error("Tenant not found or does not belong to user.");
	}
	revalidatePath("/dashboard");
	return {
		acknowledged: result.acknowledged,
		modifiedCount: result.modifiedCount,
	};
};

export const markBillAsPaid = async (
	userId: string,
	billId: string,
	paymentMessageId: string,
) => {
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
		throw new Error("Bill not found or does not belong to user.");
	}
	revalidatePath("/dashboard");
	return {
		acknowledged: result.acknowledged,
		modifiedCount: result.modifiedCount,
	};
};

export const getConsolidatedBills = async (
	userId: string,
	date?: { year: number; month: number },
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const query: Record<string, unknown> = { user_id: userId };
	if (date) {
		query.year = date.year;
		query.month = date.month;
	}
	const collection = await db
		.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
		.find(query)
		.sort({ year: -1, month: -1 }) // Sort by year descending, then month descending
		.toArray();
	return collection.map((bill) => ({
		id: bill._id.toString(),
		userId: bill.user_id,
		month: bill.month,
		year: bill.year,
		tenantId: bill.tenant_id,
		categories: Object.fromEntries(
			Object.entries(bill.categories).map(([key, value]) => {
				const v = value as {
					gmail_message_id: string;
					provider_id: string;
					provider_name: string;
					amount: number;
				};
				return [
					key,
					{
						gmailMessageId: v.gmail_message_id,
						providerId: v.provider_id,
						providerName: v.provider_name,
						amount: v.amount,
					},
				];
			}),
		),
		totalAmount: bill.total_amount,
		paid: bill.paid,
		dateSent: bill.date_sent ? new Date(bill.date_sent).toDateString() : null,
		datePaid: bill.date_paid ? new Date(bill.date_paid).toDateString() : null,
	})) as ConsolidatedBill[];
};

export const addConsolidatedBill = async (
	userId: string,
	bill: ConsolidatedBill,
) => {
	const db = client.db(process.env.MONGODB_DATABASE_NAME);
	const existingBill = await db
		.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
		.findOne({
			user_id: userId,
			year: bill.year,
			month: bill.month,
		});
	if (existingBill) {
		throw new Error(
			`Consolidated bill for ${bill.month}/${bill.year} already exists.`,
		);
	}

	const result = await db
		.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
		.insertOne({
			user_id: userId,
			year: bill.year,
			month: bill.month,
			tenant_id: bill.tenantId,
			categories: bill.categories,
			total_amount: roundToCurrency(bill.totalAmount),
			paid: bill.paid,
			date_sent: bill.dateSent,
			date_paid: bill.datePaid,
		});
	revalidatePath("/dashboard/bills");
	return {
		acknowledged: result.acknowledged,
		insertedId: result.insertedId.toString(),
	};
};
