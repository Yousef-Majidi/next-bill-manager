#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default async function diagnoseAllCollections(db) {
	console.log("📊 Diagnosing all database collections");

	// Get all collections in the database
	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((col) => col.name);

	console.log(
		`📁 Found ${collectionNames.length} collections: ${collectionNames.join(", ")}`,
	);

	if (collectionNames.length === 0) {
		console.log("⚠️  No collections found");
		return;
	}

	// Separate regular collections from backup collections
	const regularCollections = collectionNames.filter(
		(name) => !name.includes("_backup_"),
	);
	const backupCollections = collectionNames.filter((name) =>
		name.includes("_backup_"),
	);

	console.log(`\n📋 Regular collections: ${regularCollections.length}`);
	console.log(`📋 Backup collections: ${backupCollections.length}`);

	let totalDocuments = 0;
	let emptyCollections = 0;

	// Analyze each regular collection
	for (const collectionName of regularCollections) {
		const collection = db.collection(collectionName);
		const documentCount = await collection.countDocuments();

		console.log(`\n📄 ${collectionName}:`);
		console.log(`   Documents: ${documentCount}`);

		if (documentCount === 0) {
			console.log(`   Status: Empty`);
			emptyCollections++;
		} else {
			console.log(`   Status: Active`);
			totalDocuments += documentCount;

			// Show sample document structure (first document)
			try {
				const sampleDoc = await collection.findOne({});
				if (sampleDoc) {
					console.log(`   Sample fields: ${Object.keys(sampleDoc).join(", ")}`);

					// Show some sample data for common fields
					if (sampleDoc._id) {
						console.log(`   Sample _id: ${sampleDoc._id}`);
					}
					if (sampleDoc.user_id) {
						console.log(`   Sample user_id: ${sampleDoc.user_id}`);
					}
					if (sampleDoc.name) {
						console.log(`   Sample name: ${sampleDoc.name}`);
					}
					if (sampleDoc.year && sampleDoc.month) {
						console.log(
							`   Sample period: ${sampleDoc.year}-${sampleDoc.month}`,
						);
					}
				}
			} catch (error) {
				console.log(`   Error reading sample: ${error.message}`);
			}
		}
	}

	// Show backup collections summary
	if (backupCollections.length > 0) {
		console.log(`\n📋 Backup collections:`);
		backupCollections.forEach((backupName) => {
			console.log(`   - ${backupName}`);
		});
	}

	// Summary
	console.log("\n📊 Database Summary:");
	console.log(`   Total collections: ${collectionNames.length}`);
	console.log(`   Regular collections: ${regularCollections.length}`);
	console.log(`   Backup collections: ${backupCollections.length}`);
	console.log(`   Empty collections: ${emptyCollections}`);
	console.log(`   Total documents: ${totalDocuments}`);

	// Health assessment
	const healthScore =
		regularCollections.length > 0
			? ((regularCollections.length - emptyCollections) /
					regularCollections.length) *
				100
			: 0;

	console.log(`\n🏥 Database Health: ${healthScore.toFixed(1)}%`);

	if (healthScore === 100) {
		console.log("   ✅ All collections have data");
	} else if (healthScore >= 75) {
		console.log("   ⚠️  Most collections have data");
	} else if (healthScore >= 50) {
		console.log("   ⚠️  Some collections are empty");
	} else {
		console.log("   ❌ Many collections are empty");
	}

	// Recommendations
	console.log("\n💡 Recommendations:");
	if (backupCollections.length === 0) {
		console.log("   - Consider creating a backup: pnpm db:backup-all");
	} else {
		console.log("   - Backups available, database is protected");
	}

	if (emptyCollections > 0) {
		console.log("   - Some collections are empty, check if this is expected");
	}

	if (regularCollections.length === 0) {
		console.log("   - No regular collections found, database may be new");
	}
}
