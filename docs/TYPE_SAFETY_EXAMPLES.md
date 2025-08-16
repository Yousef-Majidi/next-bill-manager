# Type Safety Examples

This document provides practical examples of how to use the type safety system in real-world scenarios within the Next Bill Manager application.

## Table of Contents

1. [API Route Examples](#api-route-examples)
2. [Component Examples](#component-examples)
3. [Database Operations](#database-operations)
4. [Form Handling](#form-handling)
5. [State Management](#state-management)
6. [Error Handling Patterns](#error-handling-patterns)

## API Route Examples

### User API Route

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import {
	createDatabaseError,
	createValidationError,
	isDatabaseError,
	isValidationError,
	safeExecuteAsync,
	validateWithSchema,
} from "@/lib/common";

// Request schemas
const CreateUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	role: z.enum(["admin", "user", "manager"]),
});

const UpdateUserSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	role: z.enum(["admin", "user", "manager"]).optional(),
});

// Response schemas
const UserResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	role: z.enum(["admin", "user", "manager"]),
	createdAt: z.string(),
	updatedAt: z.string(),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;
type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
type UserResponse = z.infer<typeof UserResponseSchema>;

// POST /api/users
export async function POST(request: NextRequest) {
	const result = await safeExecuteAsync(async () => {
		// Parse and validate request body
		const body = await request.json();
		const validation = validateWithSchema(CreateUserSchema, body);

		if (!validation.success) {
			throw createValidationError(
				validation.error,
				"requestBody",
				body,
				"CreateUserSchema",
			);
		}

		const userData = validation.data;

		// Check if user already exists
		const existingUser = await db.users.findUnique({
			where: { email: userData.email },
		});

		if (existingUser) {
			throw createValidationError(
				"User with this email already exists",
				"email",
				userData.email,
				"CreateUserSchema",
			);
		}

		// Create user
		const user = await db.users.create({
			data: {
				...userData,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		// Validate response
		const responseValidation = validateWithSchema(UserResponseSchema, user);
		if (!responseValidation.success) {
			throw createDatabaseError(
				"Invalid user data returned from database",
				"CREATE",
				"users",
				user.id,
			);
		}

		return responseValidation.data;
	});

	if (!result.success) {
		const error = result.error;

		if (isValidationError(error)) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: error.field
						? `${error.field}: ${error.message}`
						: error.message,
				},
				{ status: 400 },
			);
		}

		if (isDatabaseError(error)) {
			return NextResponse.json(
				{ error: "Database operation failed", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error", details: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json(result.data, { status: 201 });
}

// PUT /api/users/[id]
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const result = await safeExecuteAsync(async () => {
		// Validate user ID
		if (!params.id || typeof params.id !== "string") {
			throw createValidationError(
				"Invalid user ID",
				"id",
				params.id,
				"UserIdSchema",
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const validation = validateWithSchema(UpdateUserSchema, body);

		if (!validation.success) {
			throw createValidationError(
				validation.error,
				"requestBody",
				body,
				"UpdateUserSchema",
			);
		}

		const updateData = validation.data;

		// Update user
		const user = await db.users.update({
			where: { id: params.id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
		});

		// Validate response
		const responseValidation = validateWithSchema(UserResponseSchema, user);
		if (!responseValidation.success) {
			throw createDatabaseError(
				"Invalid user data returned from database",
				"UPDATE",
				"users",
				params.id,
			);
		}

		return responseValidation.data;
	});

	if (!result.success) {
		const error = result.error;

		if (isValidationError(error)) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.message },
				{ status: 400 },
			);
		}

		if (isDatabaseError(error)) {
			return NextResponse.json(
				{ error: "Database operation failed", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error", details: error.message },
			{ status: 500 },
		);
	}

	return NextResponse.json(result.data);
}
```

## Component Examples

### User Form Component

```typescript
// components/users/user-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validateWithSchema, safeExecuteAsync } from "@/lib/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Form schema
const UserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "user", "manager"]),
});

type UserFormData = z.infer<typeof UserFormSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit?: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    const result = await safeExecuteAsync(async () => {
      // Additional runtime validation
      const validation = validateWithSchema(UserFormSchema, data);
      if (!validation.success) {
        throw new Error(`Form validation failed: ${validation.error}`);
      }

      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(validation.data);
      } else {
        // Default API call
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validation.data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to create user");
        }

        return await response.json();
      }
    });

    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success("User created successfully!");
      reset();
      onCancel?.();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter user name"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter user email"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          {...register("role")}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a role</option>
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

### User List Component

```typescript
// components/users/user-list.tsx
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  safeExecuteAsync,
  validateWithSchema,
  isArrayType,
  safeArrayMap
} from "@/lib/common";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// User schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["admin", "user", "manager"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UsersArraySchema = z.array(UserSchema);

type User = z.infer<typeof UserSchema>;

interface UserListProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
}

export function UserList({ onUserSelect, onUserEdit, onUserDelete }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const result = await safeExecuteAsync(async () => {
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response data
      const validation = validateWithSchema(UsersArraySchema, data);
      if (!validation.success) {
        throw new Error(`Invalid user data: ${validation.error}`);
      }

      return validation.data;
    });

    if (!result.success) {
      setError(result.error.message);
      toast.error("Failed to load users");
    } else {
      setUsers(result.data);
    }

    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await safeExecuteAsync(async () => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
    });

    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success("User deleted successfully");
      await loadUsers(); // Reload the list
      onUserDelete?.(userId);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
        <Button onClick={loadUsers} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!isArrayType(users) || users.length === 0) {
    return <div>No users found.</div>;
  }

  return (
    <div className="space-y-2">
      {safeArrayMap(users, (user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded"
        >
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {user.role}
            </span>
          </div>

          <div className="flex gap-2">
            {onUserSelect && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserSelect(user)}
              >
                View
              </Button>
            )}

            {onUserEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserEdit(user)}
              >
                Edit
              </Button>
            )}

            {onUserDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Database Operations

### Type-Safe Database Service

```typescript
// lib/services/user-service.ts
import { z } from "zod";

import {
	PerformanceMeasurer,
	TypeCache,
	createDatabaseError,
	safeExecuteAsync,
	validateWithSchema,
} from "@/lib/common";
import { db } from "@/lib/db";

// Schemas
const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	role: z.enum(["admin", "user", "manager"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const CreateUserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["admin", "user", "manager"]),
});

const UpdateUserSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	role: z.enum(["admin", "user", "manager"]).optional(),
});

type User = z.infer<typeof UserSchema>;
type CreateUserData = z.infer<typeof CreateUserSchema>;
type UpdateUserData = z.infer<typeof UpdateUserSchema>;

export class UserService {
	private cache = new TypeCache<User>(100);
	private measurer = new PerformanceMeasurer();

	async createUser(data: unknown): Promise<User> {
		const result = await safeExecuteAsync(async () => {
			// Validate input data
			const validation = validateWithSchema(CreateUserSchema, data);
			if (!validation.success) {
				throw createDatabaseError(
					`Invalid user data: ${validation.error}`,
					"CREATE",
					"users",
				);
			}

			const userData = validation.data;

			// Check for existing user
			const existingUser = await db.user.findUnique({
				where: { email: userData.email },
			});

			if (existingUser) {
				throw createDatabaseError(
					"User with this email already exists",
					"CREATE",
					"users",
				);
			}

			// Create user
			this.measurer.start("db-create-user");
			const user = await db.user.create({
				data: {
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
			this.measurer.end("db-create-user");

			// Validate response
			const responseValidation = validateWithSchema(UserSchema, user);
			if (!responseValidation.success) {
				throw createDatabaseError(
					`Invalid user data returned: ${responseValidation.error}`,
					"CREATE",
					"users",
					user.id,
				);
			}

			// Cache the result
			this.cache.set(user.id, responseValidation.data);

			return responseValidation.data;
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
			this.measurer.start("db-read-user");
			const user = await db.user.findUnique({ where: { id } });
			this.measurer.end("db-read-user");

			if (!user) {
				return null;
			}

			// Validate response
			const validation = validateWithSchema(UserSchema, user);
			if (!validation.success) {
				throw createDatabaseError(
					`Invalid user data returned: ${validation.error}`,
					"READ",
					"users",
					id,
				);
			}

			return validation.data;
		});

		if (!result.success) {
			throw result.error;
		}

		if (result.data) {
			this.cache.set(result.data.id, result.data);
		}

		return result.data;
	}

	async updateUser(id: string, data: unknown): Promise<User> {
		const result = await safeExecuteAsync(async () => {
			// Validate input data
			const validation = validateWithSchema(UpdateUserSchema, data);
			if (!validation.success) {
				throw createDatabaseError(
					`Invalid update data: ${validation.error}`,
					"UPDATE",
					"users",
					id,
				);
			}

			const updateData = validation.data;

			// Update user
			this.measurer.start("db-update-user");
			const user = await db.user.update({
				where: { id },
				data: {
					...updateData,
					updatedAt: new Date(),
				},
			});
			this.measurer.end("db-update-user");

			// Validate response
			const responseValidation = validateWithSchema(UserSchema, user);
			if (!responseValidation.success) {
				throw createDatabaseError(
					`Invalid user data returned: ${responseValidation.error}`,
					"UPDATE",
					"users",
					id,
				);
			}

			// Update cache
			this.cache.set(user.id, responseValidation.data);

			return responseValidation.data;
		});

		if (!result.success) {
			throw result.error;
		}

		return result.data;
	}

	async deleteUser(id: string): Promise<void> {
		const result = await safeExecuteAsync(async () => {
			this.measurer.start("db-delete-user");
			await db.user.delete({ where: { id } });
			this.measurer.end("db-delete-user");

			// Remove from cache
			this.cache.clear();
		});

		if (!result.success) {
			throw result.error;
		}
	}

	async listUsers(): Promise<User[]> {
		const result = await safeExecuteAsync(async () => {
			this.measurer.start("db-list-users");
			const users = await db.user.findMany({
				orderBy: { createdAt: "desc" },
			});
			this.measurer.end("db-list-users");

			// Validate each user
			const validatedUsers = users.map((user) => {
				const validation = validateWithSchema(UserSchema, user);
				if (!validation.success) {
					throw createDatabaseError(
						`Invalid user data: ${validation.error}`,
						"READ",
						"users",
						user.id,
					);
				}
				return validation.data;
			});

			return validatedUsers;
		});

		if (!result.success) {
			throw result.error;
		}

		return result.data;
	}

	getPerformanceStats() {
		return {
			createAvg: this.measurer.getAverage("db-create-user"),
			readAvg: this.measurer.getAverage("db-read-user"),
			updateAvg: this.measurer.getAverage("db-update-user"),
			deleteAvg: this.measurer.getAverage("db-delete-user"),
			listAvg: this.measurer.getAverage("db-list-users"),
			cacheSize: this.cache.size(),
		};
	}
}
```

## Form Handling

### Advanced Form with Validation

```typescript
// components/forms/advanced-user-form.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validateWithSchema, safeExecuteAsync } from "@/lib/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

// Complex form schema with conditional validation
const AdvancedUserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "user", "manager"]),
  department: z.string().optional(),
  managerId: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
  startDate: z.date().optional(),
  salary: z.number().min(0, "Salary must be positive").optional(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Custom validation: managers must have a department
  if (data.role === "manager" && !data.department) {
    return false;
  }
  return true;
}, {
  message: "Managers must have a department assigned",
  path: ["department"],
});

type AdvancedUserFormData = z.infer<typeof AdvancedUserFormSchema>;

interface AdvancedUserFormProps {
  initialData?: Partial<AdvancedUserFormData>;
  onSubmit: (data: AdvancedUserFormData) => Promise<void>;
  onCancel: () => void;
}

export function AdvancedUserForm({
  initialData,
  onSubmit,
  onCancel
}: AdvancedUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AdvancedUserFormData>({
    resolver: zodResolver(AdvancedUserFormSchema),
    defaultValues: {
      ...initialData,
      permissions: initialData?.permissions || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedRole = watch("role");

  const handleFormSubmit = async (data: AdvancedUserFormData) => {
    setIsSubmitting(true);
    setValidationErrors([]);

    const result = await safeExecuteAsync(async () => {
      // Additional runtime validation
      const validation = validateWithSchema(AdvancedUserFormSchema, data);
      if (!validation.success) {
        throw new Error(`Form validation failed: ${validation.error}`);
      }

      // Additional business logic validation
      const businessValidation = await validateBusinessRules(validation.data);
      if (!businessValidation.success) {
        setValidationErrors(businessValidation.errors);
        throw new Error("Business validation failed");
      }

      await onSubmit(validation.data);
    });

    if (!result.success) {
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
      } else {
        toast.error(result.error.message);
      }
    } else {
      toast.success("User created successfully!");
      reset();
      onCancel();
    }

    setIsSubmitting(false);
  };

  const validateBusinessRules = async (data: AdvancedUserFormData) => {
    const errors: string[] = [];

    // Check if email is already taken
    const emailCheck = await fetch(`/api/users/check-email?email=${data.email}`);
    if (emailCheck.ok) {
      const { available } = await emailCheck.json();
      if (!available) {
        errors.push("Email address is already taken");
      }
    }

    // Check if manager exists (if specified)
    if (data.managerId) {
      const managerCheck = await fetch(`/api/users/${data.managerId}`);
      if (!managerCheck.ok) {
        errors.push("Selected manager does not exist");
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {watchedRole === "manager" && (
          <div>
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              {...register("department")}
              placeholder="Enter department"
            />
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="permissions">Permissions *</Label>
        <div className="space-y-2">
          {["read", "write", "delete", "admin"].map((permission) => (
            <label key={permission} className="flex items-center">
              <input
                type="checkbox"
                value={permission}
                {...register("permissions")}
                className="mr-2"
              />
              {permission.charAt(0).toUpperCase() + permission.slice(1)}
            </label>
          ))}
        </div>
        {errors.permissions && (
          <p className="text-sm text-red-500">{errors.permissions.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate", { valueAsDate: true })}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            {...register("salary", { valueAsNumber: true })}
            placeholder="Enter salary"
          />
          {errors.salary && (
            <p className="text-sm text-red-500">{errors.salary.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("isActive")}
            className="mr-2"
          />
          Active User
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

## State Management

### Type-Safe State with Jotai

```typescript
// lib/states/user-state.ts
import { atom } from "jotai";
import { z } from "zod";

import { validateWithSchema } from "@/lib/common";

// User state schema
const UserStateSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	role: z.enum(["admin", "user", "manager"]),
	isActive: z.boolean(),
});

const UsersStateSchema = z.array(UserStateSchema);

type User = z.infer<typeof UserStateSchema>;

// Atoms
export const currentUserAtom = atom<User | null>(null);
export const usersAtom = atom<User[]>([]);
export const selectedUserAtom = atom<User | null>(null);
export const userLoadingAtom = atom<boolean>(false);
export const userErrorAtom = atom<string | null>(null);

// Derived atoms
export const activeUsersAtom = atom((get) => {
	const users = get(usersAtom);
	return users.filter((user) => user.isActive);
});

export const usersByRoleAtom = atom((get) => {
	const users = get(usersAtom);
	return users.reduce(
		(acc, user) => {
			if (!acc[user.role]) {
				acc[user.role] = [];
			}
			acc[user.role].push(user);
			return acc;
		},
		{} as Record<User["role"], User[]>,
	);
});

export const currentUserRoleAtom = atom((get) => {
	const user = get(currentUserAtom);
	return user?.role || null;
});

export const isAdminAtom = atom((get) => {
	const role = get(currentUserRoleAtom);
	return role === "admin";
});

// Actions
export const userActions = {
	setCurrentUser: (user: User | null) => (set: any) => {
		if (user) {
			const validation = validateWithSchema(UserStateSchema, user);
			if (!validation.success) {
				throw new Error(`Invalid user data: ${validation.error}`);
			}
		}
		set(currentUserAtom, user);
	},

	addUser: (user: User) => (set: any, get: any) => {
		const validation = validateWithSchema(UserStateSchema, user);
		if (!validation.success) {
			throw new Error(`Invalid user data: ${validation.error}`);
		}

		const currentUsers = get(usersAtom);
		const updatedUsers = [...currentUsers, validation.data];

		const arrayValidation = validateWithSchema(UsersStateSchema, updatedUsers);
		if (!arrayValidation.success) {
			throw new Error(`Invalid users array: ${arrayValidation.error}`);
		}

		set(usersAtom, arrayValidation.data);
	},

	updateUser: (updatedUser: User) => (set: any, get: any) => {
		const validation = validateWithSchema(UserStateSchema, updatedUser);
		if (!validation.success) {
			throw new Error(`Invalid user data: ${validation.error}`);
		}

		const currentUsers = get(usersAtom);
		const updatedUsers = currentUsers.map((user) =>
			user.id === updatedUser.id ? validation.data : user,
		);

		const arrayValidation = validateWithSchema(UsersStateSchema, updatedUsers);
		if (!arrayValidation.success) {
			throw new Error(`Invalid users array: ${arrayValidation.error}`);
		}

		set(usersAtom, arrayValidation.data);
	},

	removeUser: (userId: string) => (set: any, get: any) => {
		const currentUsers = get(usersAtom);
		const updatedUsers = currentUsers.filter((user) => user.id !== userId);

		const arrayValidation = validateWithSchema(UsersStateSchema, updatedUsers);
		if (!arrayValidation.success) {
			throw new Error(`Invalid users array: ${arrayValidation.error}`);
		}

		set(usersAtom, arrayValidation.data);
	},

	setUsers: (users: User[]) => (set: any) => {
		const validation = validateWithSchema(UsersStateSchema, users);
		if (!validation.success) {
			throw new Error(`Invalid users data: ${validation.error}`);
		}

		set(usersAtom, validation.data);
	},

	setLoading: (loading: boolean) => (set: any) => {
		set(userLoadingAtom, loading);
	},

	setError: (error: string | null) => (set: any) => {
		set(userErrorAtom, error);
	},
};
```

## Error Handling Patterns

### Global Error Boundary

```typescript
// components/error-boundary.tsx
"use client";

import React from "react";
import {
  convertToAppError,
  getErrorMessage,
  getErrorTitle,
  isValidationError,
  isDatabaseError,
  isAuthenticationError,
  isNetworkError
} from "@/lib/common";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Convert to app error for better handling
    const appError = convertToAppError(error);

    console.error("Error caught by boundary:", {
      error: appError,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });

    // Log to external service
    this.logError(appError, errorInfo);
  }

  private logError(appError: any, errorInfo: React.ErrorInfo) {
    // Send to error reporting service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: appError.message,
        fatal: true,
      });
    }
  }

  private renderErrorContent(error: Error) {
    const appError = convertToAppError(error);
    const title = getErrorTitle(appError);
    const message = getErrorMessage(appError);

    if (this.props.fallback) {
      return this.props.fallback(error);
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-500">{message}</p>
          </div>

          {this.renderErrorDetails(appError)}

          <div className="mt-6">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderErrorDetails(appError: any) {
    if (isValidationError(appError)) {
      return (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Field:</strong> {appError.field || "Unknown"}
          </p>
          {appError.schema && (
            <p className="text-sm text-yellow-800">
              <strong>Schema:</strong> {appError.schema}
            </p>
          )}
        </div>
      );
    }

    if (isDatabaseError(appError)) {
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>Operation:</strong> {appError.operation}
          </p>
          {appError.collection && (
            <p className="text-sm text-red-800">
              <strong>Collection:</strong> {appError.collection}
            </p>
          )}
        </div>
      );
    }

    if (isAuthenticationError(appError)) {
      return (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Reason:</strong> {appError.reason}
          </p>
        </div>
      );
    }

    if (isNetworkError(appError)) {
      return (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
          {appError.statusCode && (
            <p className="text-sm text-orange-800">
              <strong>Status:</strong> {appError.statusCode}
            </p>
          )}
          {appError.url && (
            <p className="text-sm text-orange-800">
              <strong>URL:</strong> {appError.url}
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.renderErrorContent(this.state.error);
    }

    return this.props.children;
  }
}
```

### Hook for Error Handling

```typescript
// hooks/use-error-handler.ts
import { useCallback, useState } from "react";

import { toast } from "sonner";

import {
	convertToAppError,
	getErrorMessage,
	isAuthenticationError,
	isDatabaseError,
	isNetworkError,
	isValidationError,
} from "@/lib/common";

interface ErrorHandlerOptions {
	showToast?: boolean;
	logToConsole?: boolean;
	onValidationError?: (error: any) => void;
	onDatabaseError?: (error: any) => void;
	onAuthenticationError?: (error: any) => void;
	onNetworkError?: (error: any) => void;
	onUnknownError?: (error: any) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
	const [lastError, setLastError] = useState<any>(null);
	const [isHandling, setIsHandling] = useState(false);

	const {
		showToast = true,
		logToConsole = true,
		onValidationError,
		onDatabaseError,
		onAuthenticationError,
		onNetworkError,
		onUnknownError,
	} = options;

	const handleError = useCallback(
		(error: unknown) => {
			setIsHandling(true);
			setLastError(error);

			const appError = convertToAppError(error);
			const message = getErrorMessage(appError);

			// Log to console if enabled
			if (logToConsole) {
				console.error("Error handled:", {
					originalError: error,
					appError,
					message,
				});
			}

			// Show toast if enabled
			if (showToast) {
				toast.error(message);
			}

			// Call specific handlers based on error type
			if (isValidationError(appError)) {
				onValidationError?.(appError);
			} else if (isDatabaseError(appError)) {
				onDatabaseError?.(appError);
			} else if (isAuthenticationError(appError)) {
				onAuthenticationError?.(appError);
			} else if (isNetworkError(appError)) {
				onNetworkError?.(appError);
			} else {
				onUnknownError?.(appError);
			}

			setIsHandling(false);
		},
		[
			showToast,
			logToConsole,
			onValidationError,
			onDatabaseError,
			onAuthenticationError,
			onNetworkError,
			onUnknownError,
		],
	);

	const clearError = useCallback(() => {
		setLastError(null);
	}, []);

	return {
		handleError,
		clearError,
		lastError,
		isHandling,
	};
}
```

These examples demonstrate how to effectively use the type safety system throughout the application, ensuring robust error handling, data validation, and type-safe operations.
