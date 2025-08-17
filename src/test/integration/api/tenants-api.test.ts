import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { apiTestUtils } from "../utils";
import { server } from "./msw-setup";

describe("Tenants API Integration", () => {
	beforeEach(() => {
		server.listen();
	});

	afterEach(() => {
		server.resetHandlers();
	});

	it("should fetch all tenants", async () => {
		const response = await fetch("/api/tenants");
		const tenants = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(tenants)).toBe(true);
		expect(tenants).toHaveLength(2);
		expect(tenants[0]).toHaveProperty("id");
		expect(tenants[0]).toHaveProperty("name");
		expect(tenants[0]).toHaveProperty("email");
	});

	it("should fetch a single tenant by id", async () => {
		const response = await fetch("/api/tenants/tenant-1");
		const tenant = await response.json();

		expect(response.status).toBe(200);
		expect(tenant.id).toBe("tenant-1");
		expect(tenant.name).toBe("John Doe");
		expect(tenant.email).toBe("john@example.com");
	});

	it("should return 404 for non-existent tenant", async () => {
		const response = await fetch("/api/tenants/non-existent");

		expect(response.status).toBe(404);
	});

	it("should create a new tenant", async () => {
		const newTenant = {
			name: "New Tenant",
			email: "new@example.com",
			phone: "+1111111111",
			address: "789 New St",
		};

		const response = await fetch("/api/tenants", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newTenant),
		});

		const createdTenant = await response.json();

		expect(response.status).toBe(201);
		expect(createdTenant).toHaveProperty("id");
		expect(createdTenant.name).toBe(newTenant.name);
		expect(createdTenant.email).toBe(newTenant.email);
		expect(createdTenant).toHaveProperty("createdAt");
		expect(createdTenant).toHaveProperty("updatedAt");
	});

	it("should update an existing tenant", async () => {
		const updates = {
			name: "Updated Name",
			email: "updated@example.com",
		};

		const response = await fetch("/api/tenants/tenant-1", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updates),
		});

		const updatedTenant = await response.json();

		expect(response.status).toBe(200);
		expect(updatedTenant.id).toBe("tenant-1");
		expect(updatedTenant.name).toBe(updates.name);
		expect(updatedTenant.email).toBe(updates.email);
		expect(updatedTenant).toHaveProperty("updatedAt");
	});

	it("should delete a tenant", async () => {
		const response = await fetch("/api/tenants/tenant-1", {
			method: "DELETE",
		});

		expect(response.status).toBe(204);
	});

	it("should handle API errors gracefully", async () => {
		// Mock an error response
		apiTestUtils.mockApiError("GET", "/api/tenants", 500);

		const response = await fetch("/api/tenants");

		expect(response.status).toBe(500);
	});
});
