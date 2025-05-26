"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/server/auth";
import client from "@/lib/server/mongodb";
import {
	ErrorType,
	User,
	UtilityProvider,
	UtilityProviderCategory,
} from "@/types";

export const getUser = async () => {
	const session = await getServerSession(authOptions);
	if (!session) redirect("/");
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
	} catch (error) {
		throw {
			code: ErrorType.DATABASE_ERROR,
			message: "Failed to fetch utility providers.",
			error: error,
		};
	}
};

export const addUtilityProvider = async (
	userId: string,
	provider: UtilityProvider,
) => {
	try {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		// check if provider already exists
		const existingProvider = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.findOne({ user_id: userId, name: provider.name });
		if (existingProvider) {
			throw {
				code: ErrorType.RESOURCE_ALREADY_EXISTS,
				message: "Provider already exists",
			};
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
	} catch (error) {
		throw {
			code: ErrorType.DATABASE_ERROR,
			message: "Failed to add utility provider.",
			error: error,
		};
	}
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
			throw {
				code: ErrorType.RESOURCE_NOT_FOUND,
				message: "Provider not found or does not belong to the user.",
			};
		}
		revalidatePath("/dashboard/providers");
		return {
			acknowledged: result.acknowledged,
			deletedCount: result.deletedCount,
		};
	} catch (error) {
		throw {
			code: ErrorType.DATABASE_ERROR,
			message: "Failed to delete utility provider.",
			error: error,
		};
	}
};
