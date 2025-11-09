#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DEMO_USER_ID = process.env.DEMO_USER_ID;
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const UTILITY_PROVIDERS_COLLECTION = process.env.MONGODB_UTILITY_PROVIDERS;
const TENANTS_COLLECTION = process.env.MONGODB_TENANTS;
const CONSOLIDATED_BILLS_COLLECTION = process.env.MONGODB_CONSOLIDATED_BILLS;

if (!DEMO_USER_ID) {
	throw new Error("Missing DEMO_USER_ID environment variable");
}

if (!DATABASE_NAME) {
	throw new Error("Missing MONGODB_DATABASE_NAME environment variable");
}

if (!UTILITY_PROVIDERS_COLLECTION) {
	throw new Error("Missing MONGODB_UTILITY_PROVIDERS environment variable");
}

if (!TENANTS_COLLECTION) {
	throw new Error("Missing MONGODB_TENANTS environment variable");
}

if (!CONSOLIDATED_BILLS_COLLECTION) {
	throw new Error("Missing MONGODB_CONSOLIDATED_BILLS environment variable");
}

export default async function createDemoUserData(db) {
	const now = new Date().toISOString();
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();

	console.log(`🚀 Creating demo user data for user: ${DEMO_USER_ID}`);
	console.log("=".repeat(50));

	// Step 0: Delete all existing demo user data
	console.log("\n🗑️  Step 0: Cleaning up existing demo data...");
	const providersCollection = db.collection(UTILITY_PROVIDERS_COLLECTION);
	const tenantsCollection = db.collection(TENANTS_COLLECTION);
	const billsCollection = db.collection(CONSOLIDATED_BILLS_COLLECTION);

	const providersCount = await providersCollection.countDocuments({
		user_id: DEMO_USER_ID,
	});
	const tenantsCount = await tenantsCollection.countDocuments({
		user_id: DEMO_USER_ID,
	});
	const billsCount = await billsCollection.countDocuments({
		user_id: DEMO_USER_ID,
	});

	if (providersCount > 0) {
		const deleteProviders = await providersCollection.deleteMany({
			user_id: DEMO_USER_ID,
		});
		console.log(`   ✅ Deleted ${deleteProviders.deletedCount} providers`);
	}

	if (tenantsCount > 0) {
		const deleteTenants = await tenantsCollection.deleteMany({
			user_id: DEMO_USER_ID,
		});
		console.log(`   ✅ Deleted ${deleteTenants.deletedCount} tenants`);
	}

	if (billsCount > 0) {
		const deleteBills = await billsCollection.deleteMany({
			user_id: DEMO_USER_ID,
		});
		console.log(`   ✅ Deleted ${deleteBills.deletedCount} bills`);
	}

	if (providersCount === 0 && tenantsCount === 0 && billsCount === 0) {
		console.log("   ℹ️  No existing demo data to clean up");
	}

	// Step 1: Create utility providers
	console.log("\n📋 Step 1: Creating utility providers...");
	const providers = [
		{
			user_id: DEMO_USER_ID,
			name: "Pacific Gas & Electric",
			category: "Electricity",
			email: "billing@pge.com",
			website: "https://www.pge.com",
			created_at: now,
			updated_at: now,
		},
		{
			user_id: DEMO_USER_ID,
			name: "San Francisco Water",
			category: "Water",
			email: "billing@sfwater.org",
			website: "https://www.sfwater.org",
			created_at: now,
			updated_at: now,
		},
		{
			user_id: DEMO_USER_ID,
			name: "Pacific Gas & Electric",
			category: "Gas",
			email: "billing@pge.com",
			website: "https://www.pge.com",
			created_at: now,
			updated_at: now,
		},
		{
			user_id: DEMO_USER_ID,
			name: "Comcast Xfinity",
			category: "Internet",
			email: "billing@comcast.com",
			website: "https://www.xfinity.com",
			created_at: now,
			updated_at: now,
		},
	];

	const providersResult = await providersCollection.insertMany(providers);
	console.log(
		`   ✅ Created ${providersResult.insertedCount} utility providers`,
	);

	// Get provider IDs for bills
	const allProviders = await providersCollection
		.find({ user_id: DEMO_USER_ID })
		.toArray();
	const providerMap = {};
	for (const provider of allProviders) {
		const category = provider.category;
		if (!providerMap[category]) {
			providerMap[category] = provider;
		}
	}

	// Step 2: Create tenants
	console.log("\n👥 Step 2: Creating tenants...");
	const tenants = [
		{
			user_id: DEMO_USER_ID,
			name: "Alice Johnson",
			email: "alice.johnson@example.com",
			secondary_name: null,
			shares: {
				Electricity: 50,
				Water: 50,
				Gas: 50,
				Internet: 50,
			},
			outstanding_balance: 125.5,
			created_at: now,
			updated_at: now,
		},
		{
			user_id: DEMO_USER_ID,
			name: "Bob Smith",
			email: "bob.smith@example.com",
			secondary_name: "Robert Smith",
			shares: {
				Electricity: 50,
				Water: 50,
				Gas: 50,
				Internet: 50,
			},
			outstanding_balance: 0,
			created_at: now,
			updated_at: now,
		},
	];

	const tenantsResult = await tenantsCollection.insertMany(tenants);
	console.log(`   ✅ Created ${tenantsResult.insertedCount} tenants`);

	// Get tenant IDs for bills
	const allTenants = await tenantsCollection
		.find({ user_id: DEMO_USER_ID })
		.toArray();
	const tenantIds = allTenants.map((t) => t._id);

	// Step 3: Create consolidated bills for recent months
	console.log("\n💰 Step 3: Creating consolidated bills...");

	// Create bills for last 12 months to have good history
	const monthsToCreate = [];
	for (let i = 0; i < 12; i++) {
		const date = new Date(currentYear, currentMonth - 1 - i, 1);
		monthsToCreate.push({
			year: date.getFullYear(),
			month: date.getMonth() + 1,
		});
	}

	let billsCreated = 0;
	for (let monthIndex = 0; monthIndex < monthsToCreate.length; monthIndex++) {
		const { year, month } = monthsToCreate[monthIndex];

		// Create bills for each tenant (if we have multiple tenants)
		for (let tenantIndex = 0; tenantIndex < tenantIds.length; tenantIndex++) {
			const tenantId = tenantIds[tenantIndex];

			// Create categories based on available providers
			const categories = {};
			let totalAmount = 0;

			if (providerMap["Electricity"]) {
				const amount = 120 + Math.floor(Math.random() * 40); // $120-$160
				categories["Electricity"] = {
					gmail_message_id: `demo-msg-${year}-${month}-electricity-${tenantIndex}`,
					provider_id: providerMap["Electricity"]._id.toString(),
					provider_name: providerMap["Electricity"].name,
					amount: amount,
				};
				totalAmount += amount;
			}

			if (providerMap["Water"]) {
				const amount = 80 + Math.floor(Math.random() * 30); // $80-$110
				categories["Water"] = {
					gmail_message_id: `demo-msg-${year}-${month}-water-${tenantIndex}`,
					provider_id: providerMap["Water"]._id.toString(),
					provider_name: providerMap["Water"].name,
					amount: amount,
				};
				totalAmount += amount;
			}

			if (providerMap["Gas"]) {
				const amount = 60 + Math.floor(Math.random() * 40); // $60-$100
				categories["Gas"] = {
					gmail_message_id: `demo-msg-${year}-${month}-gas-${tenantIndex}`,
					provider_id: providerMap["Gas"]._id.toString(),
					provider_name: providerMap["Gas"].name,
					amount: amount,
				};
				totalAmount += amount;
			}

			if (providerMap["Internet"]) {
				const amount = 79.99; // Fixed internet bill
				categories["Internet"] = {
					gmail_message_id: `demo-msg-${year}-${month}-internet-${tenantIndex}`,
					provider_id: providerMap["Internet"]._id.toString(),
					provider_name: providerMap["Internet"].name,
					amount: amount,
				};
				totalAmount += amount;
			}

			const isCurrentMonth = year === currentYear && month === currentMonth;
			const isLastMonth = year === currentYear && month === currentMonth - 1;
			const monthsAgo = monthIndex;

			// Mark bills older than 2 months as paid, keep recent ones unpaid for variety
			const shouldBePaid = monthsAgo > 2 || (isLastMonth && tenantIndex === 0); // First tenant's last month bill is paid

			// Always set date_sent for bills history (except current month)
			const dateSent = isCurrentMonth
				? null
				: new Date(year, month - 1, 10 + tenantIndex * 2).toISOString();

			const bill = {
				user_id: DEMO_USER_ID,
				year,
				month,
				tenant_id: tenantId ? tenantId.toString() : null,
				categories,
				total_amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimals
				paid: shouldBePaid,
				date_sent: dateSent,
				date_paid: shouldBePaid
					? new Date(year, month - 1, 20 + tenantIndex * 3).toISOString()
					: null,
				payment_message_id: shouldBePaid
					? `demo-payment-${year}-${month}-${tenantIndex}`
					: undefined,
				created_at: now,
				updated_at: now,
			};

			await billsCollection.insertOne(bill);
			billsCreated++;
			console.log(
				`   ✅ Created bill for ${year}-${String(month).padStart(2, "0")} (tenant ${tenantIndex + 1}) - Total: $${bill.total_amount.toFixed(2)} - ${shouldBePaid ? "Paid" : "Unpaid"}`,
			);
		}
	}

	if (billsCreated === 0) {
		console.log("   ⏭️  All bills already exist");
	}

	console.log("\n" + "=".repeat(50));
	console.log("✅ Demo user data creation completed successfully!");
	console.log(`   - User ID: ${DEMO_USER_ID}`);
	console.log(`   - Providers: ${allProviders.length}`);
	console.log(`   - Tenants: ${allTenants.length}`);
	console.log(`   - Bills created: ${billsCreated}`);
}
