#!/usr/bin/env node
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;

if (!MONGODB_URI || !DATABASE_NAME) {
	console.error("❌ Missing required environment variables:");
	console.error("   - MONGODB_URI");
	console.error("   - MONGODB_DATABASE_NAME");
	process.exit(1);
}

// Get migration file path from command line arguments
const migrationFilePath = process.argv[2];

if (!migrationFilePath) {
	console.error("❌ Missing migration file path");
	console.error("Usage: node scripts/migrate.mjs <migration_file_path>");
	console.error(
		"Example: node scripts/migrate.mjs scripts/migrations/backup-consolidated-bills.mjs",
	);
	process.exit(1);
}

// Resolve the migration file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resolvedMigrationPath = join(__dirname, "..", migrationFilePath);

// Check if migration file exists
try {
	readFileSync(resolvedMigrationPath);
} catch {
	console.error(`❌ Migration file not found: ${resolvedMigrationPath}`);
	console.error("Make sure the file exists and the path is correct");
	process.exit(1);
}

async function runMigration() {
	const client = new MongoClient(MONGODB_URI);

	try {
		console.log("🔗 Connecting to MongoDB...");
		await client.connect();

		const db = client.db(DATABASE_NAME);
		console.log(`📊 Connected to database: ${DATABASE_NAME}`);

		console.log(`🚀 Running migration: ${migrationFilePath}`);
		console.log("=".repeat(50));

		// Import and execute the migration
		const fileUrl = `file://${resolvedMigrationPath.replace(/\\/g, "/")}`;
		const migrationModule = await import(fileUrl);

		if (typeof migrationModule.default === "function") {
			// Migration exports a default function
			await migrationModule.default(db, client);
		} else if (typeof migrationModule.run === "function") {
			// Migration exports a named 'run' function
			await migrationModule.run(db, client);
		} else if (typeof migrationModule.migrate === "function") {
			// Migration exports a named 'migrate' function
			await migrationModule.migrate(db, client);
		} else {
			console.error(
				"❌ Migration file must export a default function or a named 'run'/'migrate' function",
			);
			console.error("Expected format:");
			console.error("  export default async function(db, client) { ... }");
			console.error("  or");
			console.error("  export async function run(db, client) { ... }");
			process.exit(1);
		}

		console.log("=".repeat(50));
		console.log("✅ Migration completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await client.close();
	}
}

// Run the migration
runMigration()
	.then(() => {
		console.log("\n🎉 Migration process completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Migration process failed:", error);
		process.exit(1);
	});
