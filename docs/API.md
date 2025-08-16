# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Server Actions](#server-actions)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Integration Examples](#integration-examples)

## Overview

The Next Bill Manager API is built using Next.js Server Actions, providing a type-safe and efficient way to handle data operations. All API endpoints are server-side functions that can be called directly from client components.

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
```

## Authentication

### NextAuth.js Integration

The application uses NextAuth.js for authentication with the following providers:

- **Credentials**: Email/password authentication
- **OAuth**: Google, GitHub (configurable)

### Session Management

```typescript
// Get current session
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/server/auth";

const session = await getServerSession(authOptions);

// Check authentication
if (!session) {
  return { success: false, error: "Unauthorized" };
}
```

### Protected Routes

All API endpoints require authentication unless explicitly marked as public.

## Server Actions

The application uses Next.js Server Actions with comprehensive type safety and error handling. All server actions are implemented with:

- **Type-safe validation** using Zod schemas
- **Structured error handling** with discriminated unions
- **Safe execution** with proper error boundaries
- **Database operations** with MongoDB and type-safe collections

### Bills API

#### Create Consolidated Bill

```typescript
// Server Action: lib/data/actions.ts
export const addConsolidatedBill = async (
	userId: string,
	bill: ConsolidatedBill,
) => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const billData = {
			user_id: userId,
			year: bill.year,
			month: bill.month,
			tenant_id: bill.tenantId,
			categories: bill.categories,
			total_amount: roundToCurrency(bill.totalAmount),
			paid: bill.paid,
			date_sent: bill.dateSent,
			date_paid: bill.datePaid,
		};

		const validation = validateWithSchema(
			ConsolidatedBillInsertSchema,
			billData,
		);
		if (!validation.success) {
			throw createValidationError(
				`Invalid bill data: ${validation.error}`,
				"bill",
				billData,
				"ConsolidatedBillInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const existingBill = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.findOne({
				user_id: userId,
				year: bill.year,
				month: bill.month,
			});

		if (existingBill) {
			throw createDatabaseError(
				`Consolidated bill for ${bill.month}/${bill.year} already exists.`,
				"CREATE",
				"consolidated_bills",
			);
		}

		const result = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.insertOne(validation.data);

		revalidatePath("/dashboard/bills");
		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

**Usage:**

```typescript
// Client component
import { addConsolidatedBill } from "@/lib/data/actions";

const handleSubmit = async (formData: FormData) => {
	try {
		const result = await addConsolidatedBill(userId, {
			year: parseInt(formData.get("year") as string),
			month: parseInt(formData.get("month") as string),
			tenantId: formData.get("tenantId") as string,
			categories: JSON.parse(formData.get("categories") as string),
			totalAmount: parseFloat(formData.get("totalAmount") as string),
			paid: formData.get("paid") === "true",
			dateSent: new Date(formData.get("dateSent") as string),
			datePaid: formData.get("datePaid")
				? new Date(formData.get("datePaid") as string)
				: null,
		});

		// Handle success
		toast.success("Bill created successfully");
	} catch (error) {
		// Handle error with structured error handling
		if (isValidationError(error)) {
			toast.error(`Validation error: ${error.message}`);
		} else if (isDatabaseError(error)) {
			toast.error(`Database error: ${error.message}`);
		} else {
			toast.error("An unexpected error occurred");
		}
	}
};
```

#### Get Consolidated Bills

```typescript
// Server Action: lib/data/actions.ts
export const getConsolidatedBills = async (userId: string) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const bills = await db
			.collection(process.env.MONGODB_CONSOLIDATED_BILLS!)
			.find({ user_id: userId })
			.sort({ year: -1, month: -1 })
			.toArray();

		// Validate response data
		const validation = validateWithSchema(ConsolidatedBillsArraySchema, bills);
		if (!validation.success) {
			throw createValidationError(
				`Invalid bills data: ${validation.error}`,
				"bills",
				bills,
				"ConsolidatedBillsArraySchema",
			);
		}

		return validation.data;
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

### Tenants API

#### Create Tenant

```typescript
// Server Action: lib/data/actions.ts
export const addTenant = async (
	userId: string,
	tenant: TenantFormData,
): Promise<{ acknowledged: boolean; insertedId: string }> => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const tenantData = {
			user_id: userId,
			name: tenant.name,
			email: tenant.email,
			secondary_name: tenant.secondaryName ?? null,
			shares: tenant.shares,
			outstanding_balance: 0,
		};

		const validation = validateWithSchema(TenantInsertSchema, tenantData);
		if (!validation.success) {
			throw createValidationError(
				`Invalid tenant data: ${validation.error}`,
				"tenant",
				tenantData,
				"TenantInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const result = await db
			.collection(process.env.MONGODB_TENANTS!)
			.insertOne(validation.data);

		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

#### Get Tenants

```typescript
// Server Action: lib/data/actions.ts
export const getTenants = async (userId: string) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const tenants = await db
			.collection(process.env.MONGODB_TENANTS!)
			.find({ user_id: userId })
			.sort({ name: 1 })
			.toArray();

		// Validate response data
		const validation = validateWithSchema(TenantsArraySchema, tenants);
		if (!validation.success) {
			throw createValidationError(
				`Invalid tenants data: ${validation.error}`,
				"tenants",
				tenants,
				"TenantsArraySchema",
			);
		}

		return validation.data;
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

### Providers API

#### Create Provider

```typescript
// Server Action: lib/data/actions.ts
export const addUtilityProvider = async (
	userId: string,
	provider: UtilityProvider,
) => {
	const result = await safeExecuteAsync(async () => {
		// Validate input data
		const providerData = {
			user_id: userId,
			name: provider.name,
			category: provider.category,
		};

		const validation = validateWithSchema(
			UtilityProviderInsertSchema,
			providerData,
		);
		if (!validation.success) {
			throw createValidationError(
				`Invalid provider data: ${validation.error}`,
				"provider",
				providerData,
				"UtilityProviderInsertSchema",
			);
		}

		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const existingProvider = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.findOne({ user_id: userId, name: provider.name });

		if (existingProvider) {
			throw createDatabaseError(
				`Utility provider "${provider.name}" already exists.`,
				"CREATE",
				"utility_providers",
			);
		}

		const result = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.insertOne(validation.data);

		revalidatePath("/dashboard/providers");
		return {
			acknowledged: result.acknowledged,
			insertedId: result.insertedId.toString(),
			insertedName: provider.name,
		};
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

#### Get Providers

```typescript
// Server Action: lib/data/actions.ts
export const getUtilityProviders = async (userId: string) => {
	const result = await safeExecuteAsync(async () => {
		const db = client.db(process.env.MONGODB_DATABASE_NAME);
		const providers = await db
			.collection(process.env.MONGODB_UTILITY_PROVIDERS!)
			.find({ user_id: userId })
			.sort({ name: 1 })
			.toArray();

		// Validate response data
		const validation = validateWithSchema(
			UtilityProvidersArraySchema,
			providers,
		);
		if (!validation.success) {
			throw createValidationError(
				`Invalid providers data: ${validation.error}`,
				"providers",
				providers,
				"UtilityProvidersArraySchema",
			);
		}

		return validation.data;
	});

	if (!result.success) {
		throw result.error;
	}

	return result.data;
};
```

## Type-Safe Database Operations

The application provides type-safe database operations through specialized classes:

```typescript
// Type-safe collection wrapper
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
}

// Specialized operations for each entity
export class TypeSafeTenantOperations {
	constructor(private collection: TypeSafeCollection<TenantDocument>) {}

	async getTenants(userId: string): Promise<TenantDocument[]> {
		const tenants = await this.collection.find({ user_id: userId });
		return tenants.map((tenant) => validateTenantDocument(tenant));
	}

	async createTenant(tenantData: TenantInsert): Promise<DbInsertResult> {
		const validatedData = validateTenantInsert(tenantData);
		return await this.collection.insertOne({
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}
}
```

## Data Models

### Consolidated Bill Model

```typescript
interface ConsolidatedBill {
	id: string;
	year: number;
	month: number;
	tenantId: string;
	categories: Record<string, number>;
	totalAmount: number;
	paid: boolean;
	dateSent: Date;
	datePaid?: Date;
	createdAt: Date;
	updatedAt: Date;
}

interface ConsolidatedBillDocument {
	_id: string;
	user_id: string;
	year: number;
	month: number;
	tenant_id: string;
	categories: Record<string, number>;
	total_amount: number;
	paid: boolean;
	date_sent: string;
	date_paid?: string;
	created_at: string;
	updated_at: string;
}
```

### Tenant Model

```typescript
interface Tenant {
	id: string;
	name: string;
	email: string;
	secondaryName?: string;
	shares: number;
	outstandingBalance: number;
	createdAt: Date;
	updatedAt: Date;
}

interface TenantDocument {
	_id: string;
	user_id: string;
	name: string;
	email: string;
	secondary_name?: string;
	shares: number;
	outstanding_balance: number;
	created_at: string;
	updated_at: string;
}
```

### Utility Provider Model

```typescript
interface UtilityProvider {
	id: string;
	name: string;
	category: UtilityProviderCategory;
	createdAt: Date;
	updatedAt: Date;
}

interface UtilityProviderDocument {
	_id: string;
	user_id: string;
	name: string;
	category: string;
	created_at: string;
	updated_at: string;
}

type UtilityProviderCategory =
	| "electricity"
	| "water"
	| "gas"
	| "internet"
	| "trash"
	| "other";
```

### Bill Model

```typescript
interface Bill {
	id: string;
	title: string;
	amount: number;
	dueDate: Date;
	status: "pending" | "paid" | "overdue";
	tenantId: string;
	providerId: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	// Relations
	tenant?: Tenant;
	provider?: Provider;
	user?: User;
}

interface CreateBillData {
	title: string;
	amount: number;
	dueDate: Date;
	tenantId: string;
	providerId: string;
}

interface UpdateBillData {
	title?: string;
	amount?: number;
	dueDate?: Date;
	status?: "pending" | "paid" | "overdue";
	tenantId?: string;
	providerId?: string;
}

interface BillFilters {
	status?: "pending" | "paid" | "overdue";
	tenantId?: string;
	providerId?: string;
	dueDateFrom?: Date;
	dueDateTo?: Date;
}
```

### User Model

```typescript
interface User {
	id: string;
	email: string;
	name?: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;

	// Relations
	bills?: Bill[];
	tenants?: Tenant[];
	providers?: Provider[];
}
```

## Error Handling

The API implements comprehensive error handling with structured error types:

```typescript
// Error types with discriminated unions
export type ValidationError = {
	type: "validation";
	field: string;
	value: unknown;
	schema: string;
	message: string;
};

export type DatabaseError = {
	type: "database";
	operation: string;
	table: string;
	message: string;
};

export type ApiError = {
	type: "api";
	endpoint: string;
	status: number;
	message: string;
};

export type AppError = ValidationError | DatabaseError | ApiError;

// Error factories
export function createValidationError(
	message: string,
	field: string,
	value: unknown,
	schema: string,
): ValidationError {
	return {
		type: "validation",
		field,
		value,
		schema,
		message,
	};
}

export function createDatabaseError(
	message: string,
	operation: string,
	table: string,
): DatabaseError {
	return {
		type: "database",
		operation,
		table,
		message,
	};
}

// Safe execution utilities
export async function safeExecuteAsync<T>(
	fn: () => Promise<T>,
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
	try {
		const result = await fn();
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: error as AppError };
	}
}

// Error type guards
export function isValidationError(error: unknown): error is ValidationError {
	return isObjectType(error) && error.type === "validation";
}

export function isDatabaseError(error: unknown): error is DatabaseError {
	return isObjectType(error) && error.type === "database";
}

export function isApiError(error: unknown): error is ApiError {
	return isObjectType(error) && error.type === "api";
}
```

## Integration Examples

### Complete Bill Management Flow

```typescript
// 1. Create a tenant
const createTenantResult = await createTenant({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890"
});

if (!createTenantResult.success) {
  console.error("Failed to create tenant:", createTenantResult.error);
  return;
}

const tenant = createTenantResult.data;

// 2. Create a provider
const createProviderResult = await createProvider({
  name: "Electric Company",
  serviceType: "electricity",
  accountNumber: "123456789"
});

if (!createProviderResult.success) {
  console.error("Failed to create provider:", createProviderResult.error);
  return;
}

const provider = createProviderResult.data;

// 3. Create a bill
const createBillResult = await createBill({
  title: "Electricity Bill - January 2024",
  amount: 150.00,
  dueDate: new Date("2024-02-15"),
  tenantId: tenant.id,
  providerId: provider.id
});

if (!createBillResult.success) {
  console.error("Failed to create bill:", createBillResult.error);
  return;
}

const bill = createBillResult.data;
console.log("Bill created successfully:", bill);
```

### React Component Integration

```typescript
// BillForm component
export function BillForm() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      const [tenantsResult, providersResult] = await Promise.all([
        getTenants(),
        getProviders()
      ]);

      if (tenantsResult.success) {
        setTenants(tenantsResult.data);
      }

      if (providersResult.success) {
        setProviders(providersResult.data);
      }
    };

    loadFormData();
  }, []);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createBill({
        title: formData.get("title") as string,
        amount: parseFloat(formData.get("amount") as string),
        dueDate: new Date(formData.get("dueDate") as string),
        tenantId: formData.get("tenantId") as string,
        providerId: formData.get("providerId") as string
      });

      if (result.success) {
        // Show success message
        toast.success("Bill created successfully");
        // Reset form or redirect
      } else {
        // Show error message
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Bill"}
      </button>
    </form>
  );
}
```

### Error Boundary Integration

```typescript
// Error boundary for API errors
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error?.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={<div>Error occurred</div>}
      onError={(error) => {
        setError(error);
        setHasError(true);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

This API documentation provides comprehensive information about all server actions, data models, error handling patterns, and integration examples for the Next Bill Manager application.
