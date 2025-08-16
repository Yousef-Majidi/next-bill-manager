import { ObjectId } from "mongodb";
import { Collection, Db } from "mongodb";

import {
	ConsolidatedBillDbUpdate,
	ConsolidatedBillDbUpdateSchema,
	ConsolidatedBillDocument,
	ConsolidatedBillInsert,
	TenantDbUpdate,
	TenantDbUpdateSchema,
	TenantDocument,
	TenantInsert,
	UtilityProviderDocument,
	UtilityProviderInsert,
	UtilityProviderUpdate,
	UtilityProviderUpdateSchema,
	validateConsolidatedBillDocument,
	validateConsolidatedBillInsert,
	validateTenantDocument,
	validateTenantInsert,
	validateUtilityProviderDocument,
	validateUtilityProviderInsert,
} from "./database-schemas";

// type-safe database operation results
export interface DatabaseOperationResult {
	success: boolean;
	error?: string;
}

export interface DbInsertResult extends DatabaseOperationResult {
	insertedId?: string;
}

export interface DbUpdateResult extends DatabaseOperationResult {
	matchedCount?: number;
	modifiedCount?: number;
}

export interface DbDeleteResult extends DatabaseOperationResult {
	deletedCount?: number;
}

// type-safe collection wrappers
export class TypeSafeCollection<T> {
	constructor(private collection: Collection) {}

	async findOne(filter: object): Promise<T | null> {
		try {
			const result = await this.collection.findOne(filter);
			return result as T | null;
		} catch (error) {
			console.error("Database findOne error:", error);
			throw new Error("Failed to find document");
		}
	}

	async find(filter: object): Promise<T[]> {
		try {
			const result = await this.collection.find(filter).toArray();
			return result as T[];
		} catch (error) {
			console.error("Database find error:", error);
			throw new Error("Failed to find documents");
		}
	}

	async insertOne(document: unknown): Promise<DbInsertResult> {
		try {
			const result = await this.collection.insertOne(
				document as Record<string, unknown>,
			);
			return {
				success: result.acknowledged,
				insertedId: result.insertedId.toString(),
			};
		} catch (error) {
			console.error("Database insertOne error:", error);
			return {
				success: false,
				error: "Failed to insert document",
			};
		}
	}

	async updateOne(filter: object, update: object): Promise<DbUpdateResult> {
		try {
			const result = await this.collection.updateOne(filter, update);
			return {
				success: result.acknowledged,
				matchedCount: result.matchedCount,
				modifiedCount: result.modifiedCount,
			};
		} catch (error) {
			console.error("Database updateOne error:", error);
			return {
				success: false,
				error: "Failed to update document",
			};
		}
	}

	async deleteOne(filter: object): Promise<DbDeleteResult> {
		try {
			const result = await this.collection.deleteOne(filter);
			return {
				success: result.acknowledged,
				deletedCount: result.deletedCount,
			};
		} catch (error) {
			console.error("Database deleteOne error:", error);
			return {
				success: false,
				error: "Failed to delete document",
			};
		}
	}
}

// type-safe database operations for specific collections
export class TypeSafeTenantOperations {
	constructor(private collection: TypeSafeCollection<TenantDocument>) {}

	async getTenants(userId: string): Promise<TenantDocument[]> {
		const tenants = await this.collection.find({ user_id: userId });
		return tenants.map((tenant) => validateTenantDocument(tenant));
	}

	async getTenant(
		userId: string,
		tenantId: string,
	): Promise<TenantDocument | null> {
		const tenant = await this.collection.findOne({
			_id: new ObjectId(tenantId),
			user_id: userId,
		});
		return tenant ? validateTenantDocument(tenant) : null;
	}

	async createTenant(tenantData: TenantInsert): Promise<DbInsertResult> {
		const validatedData = validateTenantInsert(tenantData);
		return await this.collection.insertOne({
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	async updateTenant(
		userId: string,
		tenantId: string,
		updateData: TenantDbUpdate,
	): Promise<DbUpdateResult> {
		const validatedData = TenantDbUpdateSchema.parse(updateData);
		return await this.collection.updateOne(
			{ _id: new ObjectId(tenantId), user_id: userId },
			{
				$set: {
					...validatedData,
					updated_at: new Date().toISOString(),
				},
			},
		);
	}

	async deleteTenant(
		userId: string,
		tenantId: string,
	): Promise<DbDeleteResult> {
		return await this.collection.deleteOne({
			_id: new ObjectId(tenantId),
			user_id: userId,
		});
	}
}

export class TypeSafeProviderOperations {
	constructor(
		private collection: TypeSafeCollection<UtilityProviderDocument>,
	) {}

	async getProviders(userId: string): Promise<UtilityProviderDocument[]> {
		const providers = await this.collection.find({ user_id: userId });
		return providers.map((provider) =>
			validateUtilityProviderDocument(provider),
		);
	}

	async getProvider(
		userId: string,
		providerId: string,
	): Promise<UtilityProviderDocument | null> {
		const provider = await this.collection.findOne({
			_id: new ObjectId(providerId),
			user_id: userId,
		});
		return provider ? validateUtilityProviderDocument(provider) : null;
	}

	async createProvider(
		providerData: UtilityProviderInsert,
	): Promise<DbInsertResult> {
		const validatedData = validateUtilityProviderInsert(providerData);
		return await this.collection.insertOne({
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	async updateProvider(
		userId: string,
		providerId: string,
		updateData: UtilityProviderUpdate,
	): Promise<DbUpdateResult> {
		const validatedData = UtilityProviderUpdateSchema.parse(updateData);
		return await this.collection.updateOne(
			{ _id: new ObjectId(providerId), user_id: userId },
			{
				$set: {
					...validatedData,
					updated_at: new Date().toISOString(),
				},
			},
		);
	}

	async deleteProvider(
		userId: string,
		providerId: string,
	): Promise<DbDeleteResult> {
		return await this.collection.deleteOne({
			_id: new ObjectId(providerId),
			user_id: userId,
		});
	}
}

export class TypeSafeBillOperations {
	constructor(
		private collection: TypeSafeCollection<ConsolidatedBillDocument>,
	) {}

	async getBills(
		userId: string,
		date?: { year: number; month: number },
	): Promise<ConsolidatedBillDocument[]> {
		const query: { user_id: string; year?: number; month?: number } = {
			user_id: userId,
		};
		if (date) {
			query.year = date.year;
			query.month = date.month;
		}
		const bills = await this.collection.find(query);
		return bills.map((bill) => validateConsolidatedBillDocument(bill));
	}

	async getBill(
		userId: string,
		billId: string,
	): Promise<ConsolidatedBillDocument | null> {
		const bill = await this.collection.findOne({
			_id: new ObjectId(billId),
			user_id: userId,
		});
		return bill ? validateConsolidatedBillDocument(bill) : null;
	}

	async createBill(billData: ConsolidatedBillInsert): Promise<DbInsertResult> {
		const validatedData = validateConsolidatedBillInsert(billData);
		return await this.collection.insertOne({
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	async updateBill(
		userId: string,
		billId: string,
		updateData: ConsolidatedBillDbUpdate,
	): Promise<DbUpdateResult> {
		const validatedData = ConsolidatedBillDbUpdateSchema.parse(updateData);
		return await this.collection.updateOne(
			{ _id: new ObjectId(billId), user_id: userId },
			{
				$set: {
					...validatedData,
					updated_at: new Date().toISOString(),
				},
			},
		);
	}

	async deleteBill(userId: string, billId: string): Promise<DbDeleteResult> {
		return await this.collection.deleteOne({
			_id: new ObjectId(billId),
			user_id: userId,
		});
	}
}

// factory function to create type-safe database operations
export function createTypeSafeDatabaseOperations(db: Db) {
	return {
		tenants: new TypeSafeTenantOperations(
			new TypeSafeCollection<TenantDocument>(
				db.collection(process.env.MONGODB_TENANTS!),
			),
		),
		providers: new TypeSafeProviderOperations(
			new TypeSafeCollection<UtilityProviderDocument>(
				db.collection(process.env.MONGODB_UTILITY_PROVIDERS!),
			),
		),
		bills: new TypeSafeBillOperations(
			new TypeSafeCollection<ConsolidatedBillDocument>(
				db.collection(process.env.MONGODB_CONSOLIDATED_BILLS!),
			),
		),
	};
}
