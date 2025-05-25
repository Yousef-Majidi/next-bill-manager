"use server";

import client from "@/lib/server/mongodb";
import { UtilityProvider, UtilityProviderCategory } from "@/types";

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
		throw new Error(`Failed to fetch utility providers: ${error}`);
	}
};
