"use server";

import { revalidatePath } from "next/cache";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/server/auth";
import client from "@/lib/server/mongodb";
import {
	Tenant,
	User,
	UtilityProvider,
	UtilityProviderCategory,
} from "@/types";

export const isTokenExpired = async (tokenExp: number) => {
	return tokenExp < Math.floor(Date.now() / 1000);
};

export const getUser = async () => {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		throw new Error("User is not authenticated.");
	}
	if (await isTokenExpired(session.accessTokenExp)) {
		throw new Error("Access token is expired.");
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
	try {
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
	} catch {
		throw new Error("Failed to fetch utility providers.");
	}
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
	try {
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
	} catch {
		throw new Error("Failed to delete utility provider.");
	}
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

export const getTenants = async (userId: string) => {
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
			shares: tenant.shares,
		})) as Tenant[];
	} catch {
		throw new Error("Failed to fetch tenants.");
	}
};
