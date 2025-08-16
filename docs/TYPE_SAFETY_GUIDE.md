# Type Safety & Data Validation Guide

## Overview

This guide covers the comprehensive type safety system implemented in the Next Bill Manager application. The system provides runtime validation, type-safe utilities, error handling, and performance optimizations while maintaining strict TypeScript compliance.

## Table of Contents

1. [TypeScript Configuration](#typescript-configuration)
2. [Runtime Validation](#runtime-validation)
3. [Type-Safe Utilities](#type-safe-utilities)
4. [Error Handling](#error-handling)
5. [Performance Optimizations](#performance-optimizations)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## TypeScript Configuration

### Strict Configuration

The project uses a strict TypeScript configuration with the following key options:

```json
{
	"compilerOptions": {
		"exactOptionalPropertyTypes": true,
		"noUncheckedIndexedAccess": true,
		"noImplicitAny": true,
		"noImplicitReturns": true,
		"noImplicitThis": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"strict": true
	}
}
```

### Key Benefits

- **`exactOptionalPropertyTypes`**: Prevents accidental assignment of `undefined` to optional properties
- **`noUncheckedIndexedAccess`**: Requires explicit checks for array/object access
- **`noImplicitAny`**: Ensures all types are explicitly defined
- **`noUnusedLocals/Parameters`**: Maintains clean code by flagging unused variables

## Runtime Validation

### Zod Schemas

All data validation uses Zod schemas for runtime type checking:

```typescript
import { z } from "zod";

// User schema with strict validation
const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string().min(1),
	role: z.enum(["admin", "user", "manager"]),
	createdAt: z.date(),
	isActive: z.boolean(),
});

// Type inference
type User = z.infer<typeof UserSchema>;

// Runtime validation
const validateUser = (data: unknown): User => {
	return UserSchema.parse(data);
};
```

### Type Guards

Use type guards for runtime type checking:

```typescript
import { isNumberType, isObjectType, isStringType } from "@/lib/common";

// Type-safe object validation
function validateUserData(data: unknown): data is User {
	if (!isObjectType(data)) return false;

	return (
		isStringType(data.id) &&
		isStringType(data.email) &&
		isStringType(data.name) &&
		isNumberType(data.age)
	);
}

// Usage
const userData = getDataFromAPI();
if (validateUserData(userData)) {
	// TypeScript knows userData is User type
	console.log(userData.name); // ✅ Safe access
}
```

## Type-Safe Utilities

### Object Operations

```typescript
import {
	hasProperty,
	safeGetProperty,
	safeMerge,
	safeOmit,
	safePick,
} from "@/lib/common";

// Safe property access
const user = { name: "John", age: 30 };
const name = safeGetProperty(user, "name"); // "John" | undefined
const hasAge = hasProperty(user, "age"); // true

// Safe object manipulation
const userWithEmail = safeMerge(user, { email: "john@example.com" });
const publicInfo = safePick(user, ["name"]); // { name: "John" }
const privateInfo = safeOmit(user, ["age"]); // { name: "John" }
```

### Array Operations

```typescript
import { safeArrayAccess, safeArrayFilter, safeArrayMap } from "@/lib/common";

const numbers = [1, 2, 3, 4, 5];

// Safe array access
const first = safeArrayAccess(numbers, 0); // 1 | undefined
const tenth = safeArrayAccess(numbers, 9); // undefined

// Safe array operations
const doubled = safeArrayMap(numbers, (n) => n * 2); // [2, 4, 6, 8, 10]
const evens = safeArrayFilter(numbers, (n) => n % 2 === 0); // [2, 4]
```

### Validation Utilities

```typescript
import { safeValidateWithSchema, validateWithSchema } from "@/lib/common";

// With error handling
const result = validateWithSchema(UserSchema, userData);
if (result.success) {
	const user = result.data; // Type-safe user
} else {
	console.error(result.error); // Validation error message
}

// Without error handling (returns null on failure)
const user = safeValidateWithSchema(UserSchema, userData);
if (user) {
	// user is guaranteed to be valid
}
```

## Error Handling

### Structured Error Types

```typescript
import {
	createAuthenticationError,
	createDatabaseError,
	createValidationError,
	isDatabaseError,
	isValidationError,
} from "@/lib/common";

// Creating specific error types
const validationError = createValidationError(
	"Invalid email format",
	"email",
	"invalid-email",
	"UserSchema",
);

const dbError = createDatabaseError(
	"Connection timeout",
	"READ",
	"users",
	"user-123",
);

const authError = createAuthenticationError(
	"Token expired",
	"TOKEN_EXPIRED",
	"user-456",
);
```

### Safe Execution

```typescript
import { safeExecute, safeExecuteAsync } from "@/lib/common";

// Synchronous safe execution
const result = safeExecute(() => {
	return expensiveOperation();
});

if (result.success) {
	console.log(result.data);
} else {
	console.error(result.error.message);
}

// Asynchronous safe execution
const asyncResult = await safeExecuteAsync(async () => {
	return await fetchUserData();
});

if (asyncResult.success) {
	const user = asyncResult.data;
} else {
	handleError(asyncResult.error);
}
```

### Error Conversion

```typescript
import { convertToAppError, getErrorMessage } from "@/lib/common";

try {
	// Some operation that might throw
	processUserData();
} catch (error) {
	const appError = convertToAppError(error);
	const message = getErrorMessage(appError);

	if (isValidationError(appError)) {
		// Handle validation errors specifically
		showValidationError(appError.field, message);
	} else if (isDatabaseError(appError)) {
		// Handle database errors
		showDatabaseError(message);
	}
}
```

## Performance Optimizations

### Type Caching

```typescript
import { TypeCache } from "@/lib/common";

// Create a cache for expensive operations
const userCache = new TypeCache<User>(100);

// Cache expensive user lookups
function getUser(id: string): User | undefined {
	if (userCache.has(id)) {
		return userCache.get(id);
	}

	const user = fetchUserFromDatabase(id);
	if (user) {
		userCache.set(id, user);
	}

	return user;
}
```

### Lazy Evaluation

```typescript
import { createLazyAsyncType, createLazyType } from "@/lib/common";

// Lazy initialization of expensive resources
const expensiveService = createLazyType(() => {
	return new ExpensiveService();
});

// Usage - only created when first accessed
const service = expensiveService();

// Async lazy loading
const userData = createLazyAsyncType(async () => {
	return await fetchUserData();
});

// Usage - cached promise
const data = await userData();
```

### Object Pooling

```typescript
import { TypePool } from "@/lib/common";

// Create a pool for expensive objects
const connectionPool = new TypePool(
	() => new DatabaseConnection(),
	(conn) => conn.reset(),
	10, // max pool size
);

// Acquire and release connections
const connection = connectionPool.acquire();
try {
	await connection.executeQuery("SELECT * FROM users");
} finally {
	connectionPool.release(connection);
}
```

### Performance Measurement

```typescript
import { PerformanceMeasurer } from "@/lib/common";

const measurer = new PerformanceMeasurer();

// Measure operation performance
measurer.start("user-fetch");
const user = await fetchUser(id);
const duration = measurer.end("user-fetch");

// Get statistics
const avgDuration = measurer.getAverage("user-fetch");
const minDuration = measurer.getMin("user-fetch");
const maxDuration = measurer.getMax("user-fetch");
```

## Best Practices

### 1. Always Use Type Guards

```typescript
// ❌ Bad - unsafe access
function processData(data: unknown) {
  return data.name; // TypeScript error
}

// ✅ Good - type-safe access
function processData(data: unknown) {
  if (!isObjectType(data) || !hasProperty(data, "name")) {
    throw new Error("Invalid data structure");
  }
  return data.name; // Safe access
}
```

### 2. Validate External Data

```typescript
// ❌ Bad - trusting external data
function handleAPIResponse(response: unknown) {
  const user = response as User; // Unsafe
  return user.name;
}

// ✅ Good - validate external data
function handleAPIResponse(response: unknown) {
  const result = validateWithSchema(UserSchema, response);
  if (!result.success) {
    throw new Error(`Invalid user data: ${result.error}`);
  }
  return result.data.name; // Guaranteed safe
}
```

### 3. Use Discriminated Unions

```typescript
// ✅ Good - discriminated union for API responses
type APIResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string };

function handleResponse<T>(response: APIResponse<T>): T {
	if (response.success) {
		return response.data; // TypeScript knows this is safe
	} else {
		throw new Error(response.error);
	}
}
```

### 4. Handle Optional Properties Correctly

```typescript
// ❌ Bad - with exactOptionalPropertyTypes
interface User {
  name: string;
  email?: string;
}

const user: User = {
  name: "John",
  email: undefined, // Error with exactOptionalPropertyTypes
};

// ✅ Good - handle optional properties correctly
const user: User = {
  name: "John",
  // email omitted entirely
};

// Or explicitly allow undefined
interface User {
  name: string;
  email?: string | undefined;
}
```

### 5. Use Safe Array Access

```typescript
// ❌ Bad - unsafe array access
function getFirstItem<T>(array: T[]): T {
  return array[0]; // Could be undefined
}

// ✅ Good - safe array access
function getFirstItem<T>(array: T[]): T | undefined {
  return safeArrayAccess(array, 0);
}

// Or with validation
function getFirstItem<T>(array: T[]): T {
  const item = safeArrayAccess(array, 0);
  if (item === undefined) {
    throw new Error("Array is empty");
  }
  return item;
}
```

## Examples

### Complete User Management Example

```typescript
import { z } from "zod";

import {
	PerformanceMeasurer,
	TypeCache,
	createValidationError,
	safeExecuteAsync,
	validateWithSchema,
} from "@/lib/common";

// Schema definition
const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string().min(1),
	role: z.enum(["admin", "user", "manager"]),
	createdAt: z.date(),
	isActive: z.boolean(),
});

type User = z.infer<typeof UserSchema>;

// User service with type safety
class UserService {
	private cache = new TypeCache<User>(100);
	private measurer = new PerformanceMeasurer();

	async createUser(userData: unknown): Promise<User> {
		const result = await safeExecuteAsync(async () => {
			// Validate input
			const validatedUser = validateWithSchema(UserSchema, userData);
			if (!validatedUser.success) {
				throw createValidationError(
					validatedUser.error,
					"userData",
					userData,
					"UserSchema",
				);
			}

			// Measure database operation
			this.measurer.start("db-create");
			const user = await this.database.create(validatedUser.data);
			this.measurer.end("db-create");

			// Cache the result
			this.cache.set(user.id, user);

			return user;
		});

		if (!result.success) {
			throw result.error;
		}

		return result.data;
	}

	async getUser(id: string): Promise<User | null> {
		// Check cache first
		const cached = this.cache.get(id);
		if (cached) {
			return cached;
		}

		const result = await safeExecuteAsync(async () => {
			this.measurer.start("db-read");
			const user = await this.database.findById(id);
			this.measurer.end("db-read");
			return user;
		});

		if (!result.success) {
			console.error("Failed to fetch user:", result.error.message);
			return null;
		}

		if (result.data) {
			this.cache.set(result.data.id, result.data);
		}

		return result.data;
	}

	getPerformanceStats() {
		return {
			createAvg: this.measurer.getAverage("db-create"),
			readAvg: this.measurer.getAverage("db-read"),
			cacheSize: this.cache.size(),
		};
	}
}
```

### Form Validation Example

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateWithSchema } from "@/lib/common";

// Form schema
const UserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

type UserFormData = z.infer<typeof UserFormSchema>;

// Form component with type safety
function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    // Additional runtime validation
    const validation = validateWithSchema(UserFormSchema, data);
    if (!validation.success) {
      console.error("Form validation failed:", validation.error);
      return;
    }

    // Process the validated data
    await createUser(validation.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("age", { valueAsNumber: true })} placeholder="Age" />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### API Contract Example

```typescript
import { z } from "zod";

// Request schemas
const CreateUserRequestSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["user", "admin"]),
});

const UpdateUserRequestSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	role: z.enum(["user", "admin"]).optional(),
});

// Response schemas
const UserResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	role: z.enum(["user", "admin"]),
	createdAt: z.string(),
});

const ErrorResponseSchema = z.object({
	error: z.string(),
	code: z.string(),
	details: z.record(z.unknown()).optional(),
});

// API contract with discriminated unions
type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
type UserResponse = z.infer<typeof UserResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

type APIResponse<T> =
	| { success: true; data: T }
	| { success: false; error: ErrorResponse };

// API handler with type safety
async function handleCreateUser(
	request: CreateUserRequest,
): Promise<APIResponse<UserResponse>> {
	try {
		// Validate request
		const validatedRequest = CreateUserRequestSchema.parse(request);

		// Process request
		const user = await createUser(validatedRequest);

		// Validate response
		const response = UserResponseSchema.parse(user);

		return { success: true, data: response };
	} catch (error) {
		const errorResponse = ErrorResponseSchema.parse({
			error: "Failed to create user",
			code: "CREATE_USER_ERROR",
			details: { originalError: error },
		});

		return { success: false, error: errorResponse };
	}
}
```

## Conclusion

This type safety system provides:

- **Runtime validation** with Zod schemas
- **Type-safe utilities** for common operations
- **Structured error handling** with specific error types
- **Performance optimizations** with caching and pooling
- **Zero TypeScript errors** with strict configuration

By following these patterns and using the provided utilities, you can build robust, type-safe applications that catch errors at compile time and runtime.
