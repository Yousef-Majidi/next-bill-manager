# API Documentation

## Overview

The Next Bill Manager API provides server actions for bill management, tenant management, and provider management.

## Key Concepts

- **Server Actions**: Next.js server actions for data operations
- **Type Safety**: Zod schemas for runtime validation
- **Error Handling**: Structured error responses
- **Authentication**: Session-based authentication

## Authentication

### Session Management

The API uses NextAuth.js for authentication. All server actions automatically validate the user session.

```typescript
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/server/auth";

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
	throw new Error("Unauthorized");
}
```

## Server Actions

### Bills API

#### Create Consolidated Bill

**Purpose**: Creates a new consolidated bill for a specific month and year.

**Parameters**:

- `userId`: The authenticated user's ID
- `bill`: Consolidated bill data including year, month, tenant, categories, and amounts

**Process**:

1. Validates input data using Zod schemas
2. Checks for existing bills to prevent duplicates
3. Inserts the bill into the database
4. Revalidates the bills page cache
5. Returns success/error response

**Usage Example**:

```typescript
import { addConsolidatedBill } from "@/lib/data/actions";

const result = await addConsolidatedBill(userId, {
	year: 2024,
	month: 1,
	tenantId: "tenant_id",
	categories: { electricity: 150, water: 75 },
	totalAmount: 225,
	paid: false,
	dateSent: new Date(),
});
```

#### Get Consolidated Bills

**Purpose**: Retrieves all consolidated bills for a user, sorted by date.

**Parameters**:

- `userId`: The authenticated user's ID
- `filters`: Optional filters for year, month, tenant, and payment status

**Usage Example**:

```typescript
import { getConsolidatedBills } from "@/lib/data/actions";

const bills = await getConsolidatedBills(userId, {
	year: 2024,
	month: 1,
	tenantId: "tenant_id",
});
```

### Tenants API

#### Create Tenant

**Purpose**: Creates a new tenant for bill management.

**Parameters**:

- `userId`: The authenticated user's ID
- `tenant`: Tenant data including name, email, and phone

**Usage Example**:

```typescript
import { addTenant } from "@/lib/data/actions";

const result = await addTenant(userId, {
	name: "John Doe",
	email: "john@example.com",
	shares: 50, // 50% share of bills
});
```

#### Get Tenants

**Purpose**: Retrieves all tenants for a user.

**Usage Example**:

```typescript
import { getTenants } from "@/lib/data/actions";

const tenants = await getTenants(userId);
```

### Providers API

#### Create Provider

**Purpose**: Creates a new utility provider for bill categorization.

**Parameters**:

- `userId`: The authenticated user's ID
- `provider`: Provider data including name and category

**Usage Example**:

```typescript
import { addUtilityProvider } from "@/lib/data/actions";

const result = await addUtilityProvider(userId, {
	name: "Electric Company",
	category: "electricity",
});
```

#### Get Providers

**Purpose**: Retrieves all providers for a user.

**Usage Example**:

```typescript
import { getUtilityProviders } from "@/lib/data/actions";

const providers = await getUtilityProvider(userId);
```

## Data Models

### Consolidated Bill

**Purpose**: Represents a monthly bill for a tenant with multiple utility categories.

**Key Fields**:

- `year`, `month`: Billing period
- `tenantId`: Associated tenant
- `categories`: Breakdown by utility type (electricity, water, etc.)
- `totalAmount`: Total bill amount
- `paid`: Payment status
- `dateSent`, `datePaid`: Important dates

### Tenant

**Purpose**: Represents a tenant who receives bills.

**Key Fields**:

- `id`: Unique identifier
- `name`, `email`: Contact information
- `shares`: Percentage share of bills (e.g., 50 for 50%)
- `outstandingBalance`: Current unpaid amount
- `createdAt`, `updatedAt`: Timestamps

### Utility Provider

**Purpose**: Represents a utility service provider.

**Key Fields**:

- `name`: Provider name
- `category`: Utility category (electricity, water, etc.)
- `createdAt`, `updatedAt`: Timestamps

### Bill

**Purpose**: Individual bill record in the database.

**Key Fields**:

- `user_id`: Associated user
- `year`, `month`: Billing period
- `tenant_id`: Associated tenant
- `categories`: Utility breakdown
- `total_amount`: Total amount
- `status`: Payment status

### User

**Purpose**: Application user with authentication.

**Key Fields**:

- `id`: Unique identifier
- `email`: User email
- `name`: User name
- `createdAt`, `updatedAt`: Timestamps

## Error Handling

### Error Types

- **ValidationError**: Invalid input data
- **DatabaseError**: Database operation failures
- **ApiError**: External API failures

### Error Response Format

```typescript
{
  success: false,
  error: {
    type: "validation" | "database" | "api",
    message: "Error description",
    field?: "field_name",
    code?: "error_code"
  }
}
```

### Error Handling in Components

```typescript
import { toast } from "sonner";

const result = await addConsolidatedBill(userId, billData);
if (!result.success) {
	toast.error(result.error.message);
} else {
	toast.success("Bill created successfully");
}
```

## Usage Examples

### Basic Bill Management

```typescript
// Create a new bill
const billResult = await addConsolidatedBill(userId, {
	year: 2024,
	month: 1,
	tenantId: "tenant_123",
	categories: { electricity: 150, water: 75 },
	totalAmount: 225,
	paid: false,
	dateSent: new Date(),
});

// Get bills for a specific period
const bills = await getBills(userId, { year: 2024, month: 1 });
```

### Tenant Management

```typescript
// Create a new tenant
const tenantResult = await addTenant(userId, {
	name: "Jane Smith",
	email: "jane@example.com",
	phone: "+1234567890",
});

// Get all tenants
const tenants = await getTenants(userId);
```

### Provider Management

```typescript
// Create a new provider
const providerResult = await addProvider(userId, {
	name: "Water Company",
	category: "water",
});

// Get all providers
const providers = await getProviders(userId);
```

### Common Patterns

#### Error Handling

```typescript
async function handleBillCreation(billData) {
	try {
		const result = await addConsolidatedBill(userId, billData);
		if (result.success) {
			toast.success("Bill created successfully");
			return result.data;
		} else {
			toast.error(result.error.message);
			return null;
		}
	} catch (error) {
		toast.error("An unexpected error occurred");
		console.error(error);
		return null;
	}
}
```

#### Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit(data) {
	setIsLoading(true);
	try {
		const result = await addConsolidatedBill(userId, data);
		if (result.success) {
			toast.success("Success!");
		}
	} finally {
		setIsLoading(false);
	}
}
```
