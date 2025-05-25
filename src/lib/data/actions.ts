import { client } from "@/lib/server";

export const getUtilityProviders = async () => {
	try {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const collection = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.find({})
			.toArray();
		return collection.map((provider) => ({
			id: provider._id.toString(),
			name: provider.name,
			category: provider.category,
		}));
	} catch (error) {
		throw new Error(`Failed to fetch utility providers: ${error}`);
	}
};
