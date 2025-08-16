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

### Bills API

#### Create Bill

```typescript
// Server Action: features/bills/actions/createBill.ts
export async function createBill(
	data: CreateBillData,
): Promise<ApiResponse<Bill>> {
	try {
		// Validate input
		const validatedData = createBillSchema.parse(data);

		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		// Create bill in database
		const bill = await db.bills.create({
			data: {
				...validatedData,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return { success: true, data: bill };
	} catch (error) {
		console.error("Error creating bill:", error);
		return { success: false, error: error.message };
	}
}
```

**Usage:**

```typescript
// Client component
import { createBill } from "@/features/bills/actions";

const handleSubmit = async (formData: FormData) => {
	const result = await createBill({
		title: formData.get("title") as string,
		amount: parseFloat(formData.get("amount") as string),
		dueDate: new Date(formData.get("dueDate") as string),
		tenantId: formData.get("tenantId") as string,
		providerId: formData.get("providerId") as string,
	});

	if (result.success) {
		// Handle success
	} else {
		// Handle error
	}
};
```

#### Get Bills

```typescript
// Server Action: features/bills/actions/getBills.ts
export async function getBills(
	filters?: BillFilters,
): Promise<ApiResponse<Bill[]>> {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const bills = await db.bills.findMany({
			where: {
				userId: session.user.id,
				...filters,
			},
			include: {
				tenant: true,
				provider: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return { success: true, data: bills };
	} catch (error) {
		console.error("Error fetching bills:", error);
		return { success: false, error: error.message };
	}
}
```

#### Update Bill

```typescript
// Server Action: features/bills/actions/updateBill.ts
export async function updateBill(
	id: string,
	data: UpdateBillData,
): Promise<ApiResponse<Bill>> {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const bill = await db.bills.update({
			where: { id, userId: session.user.id },
			data: { ...data, updatedAt: new Date() },
		});

		return { success: true, data: bill };
	} catch (error) {
		console.error("Error updating bill:", error);
		return { success: false, error: error.message };
	}
}
```

#### Delete Bill

```typescript
// Server Action: features/bills/actions/deleteBill.ts
export async function deleteBill(id: string): Promise<ApiResponse<void>> {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		await db.bills.delete({
			where: { id, userId: session.user.id },
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting bill:", error);
		return { success: false, error: error.message };
	}
}
```

### Tenants API

#### Create Tenant

```typescript
// Server Action: features/tenants/actions/createTenant.ts
export async function createTenant(
	data: CreateTenantData,
): Promise<ApiResponse<Tenant>> {
	try {
		const validatedData = createTenantSchema.parse(data);
		const session = await getServerSession(authOptions);

		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const tenant = await db.tenants.create({
			data: {
				...validatedData,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return { success: true, data: tenant };
	} catch (error) {
		console.error("Error creating tenant:", error);
		return { success: false, error: error.message };
	}
}
```

#### Get Tenants

```typescript
// Server Action: features/tenants/actions/getTenants.ts
export async function getTenants(): Promise<ApiResponse<Tenant[]>> {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const tenants = await db.tenants.findMany({
			where: { userId: session.user.id },
			orderBy: { name: "asc" },
		});

		return { success: true, data: tenants };
	} catch (error) {
		console.error("Error fetching tenants:", error);
		return { success: false, error: error.message };
	}
}
```

### Providers API

#### Create Provider

```typescript
// Server Action: features/providers/actions/createProvider.ts
export async function createProvider(
	data: CreateProviderData,
): Promise<ApiResponse<Provider>> {
	try {
		const validatedData = createProviderSchema.parse(data);
		const session = await getServerSession(authOptions);

		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const provider = await db.providers.create({
			data: {
				...validatedData,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return { success: true, data: provider };
	} catch (error) {
		console.error("Error creating provider:", error);
		return { success: false, error: error.message };
	}
}
```

#### Get Providers

```typescript
// Server Action: features/providers/actions/getProviders.ts
export async function getProviders(): Promise<ApiResponse<Provider[]>> {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}

		const providers = await db.providers.findMany({
			where: { userId: session.user.id },
			orderBy: { name: "asc" },
		});

		return { success: true, data: providers };
	} catch (error) {
		console.error("Error fetching providers:", error);
		return { success: false, error: error.message };
	}
}
```

## Data Models

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

### Tenant Model

```typescript
interface Tenant {
	id: string;
	name: string;
	email: string;
	phone?: string;
	address?: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	// Relations
	bills?: Bill[];
	user?: User;
}

interface CreateTenantData {
	name: string;
	email: string;
	phone?: string;
	address?: string;
}

interface UpdateTenantData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
}
```

### Provider Model

```typescript
interface Provider {
	id: string;
	name: string;
	serviceType: "electricity" | "water" | "gas" | "internet" | "other";
	accountNumber?: string;
	contactEmail?: string;
	contactPhone?: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	// Relations
	bills?: Bill[];
	user?: User;
}

interface CreateProviderData {
	name: string;
	serviceType: "electricity" | "water" | "gas" | "internet" | "other";
	accountNumber?: string;
	contactEmail?: string;
	contactPhone?: string;
}

interface UpdateProviderData {
	name?: string;
	serviceType?: "electricity" | "water" | "gas" | "internet" | "other";
	accountNumber?: string;
	contactEmail?: string;
	contactPhone?: string;
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

### Error Types

```typescript
interface ApiError {
	code: string;
	message: string;
	details?: any;
}

// Common error codes
const ERROR_CODES = {
	UNAUTHORIZED: "UNAUTHORIZED",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
```

### Error Handling Patterns

```typescript
// Validation errors
try {
  const validatedData = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: "Validation failed",
      details: error.errors
    };
  }
}

// Database errors
try {
  const result = await db.operation();
} catch (error) {
  if (error.code === "P2002") {
    return {
      success: false,
      error: "Resource already exists"
    };
  }

  if (error.code === "P2025") {
    return {
      success: false,
      error: "Resource not found"
    };
  }

  return {
    success: false,
    error: "Database operation failed"
  };
}
```

### Client-Side Error Handling

```typescript
// Custom hook for API calls
export function useApiCall<T, D>(
	apiFunction: (data: D) => Promise<ApiResponse<T>>,
) {
	const [data, setData] = useState<T | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(
		async (apiData: D) => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await apiFunction(apiData);

				if (result.success) {
					setData(result.data);
					return result;
				} else {
					setError(result.error);
					return result;
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				setError(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setIsLoading(false);
			}
		},
		[apiFunction],
	);

	return { data, isLoading, error, execute };
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
