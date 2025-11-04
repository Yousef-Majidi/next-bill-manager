# Type Safety Guide

## Overview

This guide covers the type safety system used in the Next Bill Manager application.

## TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
	"compilerOptions": {
		"exactOptionalPropertyTypes": true,
		"noUncheckedIndexedAccess": true,
		"noImplicitAny": true,
		"strict": true
	}
}
```

## Runtime Validation

### Zod Schemas

Use Zod schemas for runtime validation:

```typescript
import { z } from "zod";

const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string().min(1),
	role: z.enum(["admin", "user", "manager"]),
});

type User = z.infer<typeof UserSchema>;
```

### Validation Utilities

```typescript
import { validateWithSchema } from "@/lib/common";

const result = validateWithSchema(UserSchema, userData);
if (result.success) {
	const user = result.data; // Type-safe user
} else {
	console.error(result.error);
}
```

## Error Handling

### Structured Error Types

```typescript
import { createDatabaseError, createValidationError } from "@/lib/common";

const validationError = createValidationError(
	"Invalid email",
	"email",
	"invalid",
	"UserSchema",
);
const dbError = createDatabaseError(
	"Connection failed",
	"READ",
	"users",
	"user-123",
);
```

### Safe Execution

```typescript
import { safeExecuteAsync } from "@/lib/common";

const result = await safeExecuteAsync(async () => {
	return await fetchUserData();
});

if (result.success) {
	const user = result.data;
} else {
	handleError(result.error);
}
```

## Common Patterns

### Form Validation

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const UserFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
});

function UserForm() {
	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(UserFormSchema),
	});

	const onSubmit = async (data) => {
		await createUser(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register("name")} />
			{errors.name && <span>{errors.name.message}</span>}
			<input {...register("email")} />
			{errors.email && <span>{errors.email.message}</span>}
		</form>
	);
}
```

### API Contracts

```typescript
const CreateUserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

async function handleCreateUser(request: CreateUserRequest) {
	const validatedRequest = CreateUserSchema.parse(request);
	const user = await createUser(validatedRequest);
	return { success: true, data: user };
}
```

## Key Points

- Use Zod schemas for runtime validation
- Implement structured error handling
- Use safe execution utilities for error boundaries
- Validate all external data
- Use type inference from schemas
