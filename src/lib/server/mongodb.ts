import { MongoClient } from "mongodb";

// During build time, environment variables might not be available
// We'll handle this gracefully by checking if MONGODB_URI is missing
const isBuildTime = !process.env.MONGODB_URI;

if (!process.env.MONGODB_URI && !isBuildTime) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let client: MongoClient;

// If we're in build time and don't have MONGODB_URI, create a dummy client
if (isBuildTime) {
	// Create a dummy client for build time
	client = {
		db: () => ({
			collection: () => ({
				find: () => ({ toArray: async () => [] }),
				findOne: async () => null,
				insertOne: async () => ({ acknowledged: false }),
				deleteOne: async () => ({ deletedCount: 0 }),
				updateOne: async () => ({ modifiedCount: 0 }),
			}),
		}),
		connect: async () => {},
		close: async () => {},
	} as unknown as MongoClient;
} else {
	const uri = process.env.MONGODB_URI!;
	const options = {};

	if (process.env.NODE_ENV === "development") {
		// In development mode, use a global variable so that the value
		// is preserved across module reloads caused by HMR (Hot Module Replacement).
		const globalWithMongo = global as typeof globalThis & {
			_mongoClient?: MongoClient;
		};

		if (!globalWithMongo._mongoClient) {
			globalWithMongo._mongoClient = new MongoClient(uri, options);
		}
		client = globalWithMongo._mongoClient;
	} else {
		// In production mode, it's best to not use a global variable.
		client = new MongoClient(uri, options);
	}

	// Connect to MongoDB
	await client.connect();
}

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
export default client;
