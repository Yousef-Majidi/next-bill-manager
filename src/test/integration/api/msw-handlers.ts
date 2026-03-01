import { HttpResponse, http } from "msw";

// Mock data for API responses
const mockTenants = [
	{
		id: "tenant-1",
		name: "John Doe",
		email: "john@example.com",
		phone: "+1234567890",
		address: "123 Main St",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "tenant-2",
		name: "Jane Smith",
		email: "jane@example.com",
		phone: "+0987654321",
		address: "456 Oak Ave",
		createdAt: "2024-01-02T00:00:00.000Z",
		updatedAt: "2024-01-02T00:00:00.000Z",
	},
];

const mockProviders = [
	{
		id: "provider-1",
		name: "Electric Company",
		type: "electricity",
		accountNumber: "ELEC123456",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "provider-2",
		name: "Water Utility",
		type: "water",
		accountNumber: "WATER789012",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
];

const mockBills = [
	{
		id: "bill-1",
		tenantId: "tenant-1",
		providerId: "provider-1",
		amount: 150.0,
		dueDate: "2024-02-01T00:00:00.000Z",
		status: "pending",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "bill-2",
		tenantId: "tenant-2",
		providerId: "provider-2",
		amount: 75.5,
		dueDate: "2024-02-15T00:00:00.000Z",
		status: "paid",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
];

// API handlers
export const handlers = [
	// Tenants API
	http.get("/api/tenants", () => {
		return HttpResponse.json(mockTenants);
	}),

	http.get("/api/tenants/:id", ({ params }) => {
		const tenant = mockTenants.find((t) => t.id === params.id);
		if (!tenant) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(tenant);
	}),

	http.post("/api/tenants", async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>;
		const newTenant = {
			id: `tenant-${Date.now()}`,
			...body,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		return HttpResponse.json(newTenant, { status: 201 });
	}),

	http.put("/api/tenants/:id", async ({ params, request }) => {
		const body = (await request.json()) as Record<string, unknown>;
		const tenant = mockTenants.find((t) => t.id === params.id);
		if (!tenant) {
			return new HttpResponse(null, { status: 404 });
		}
		const updatedTenant = {
			...tenant,
			...body,
			updatedAt: new Date().toISOString(),
		};
		return HttpResponse.json(updatedTenant);
	}),

	http.delete("/api/tenants/:id", ({ params }) => {
		const tenant = mockTenants.find((t) => t.id === params.id);
		if (!tenant) {
			return new HttpResponse(null, { status: 404 });
		}
		return new HttpResponse(null, { status: 204 });
	}),

	// Providers API
	http.get("/api/providers", () => {
		return HttpResponse.json(mockProviders);
	}),

	http.get("/api/providers/:id", ({ params }) => {
		const provider = mockProviders.find((p) => p.id === params.id);
		if (!provider) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(provider);
	}),

	http.post("/api/providers", async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>;
		const newProvider = {
			id: `provider-${Date.now()}`,
			...body,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		return HttpResponse.json(newProvider, { status: 201 });
	}),

	// Bills API
	http.get("/api/bills", () => {
		return HttpResponse.json(mockBills);
	}),

	http.get("/api/bills/:id", ({ params }) => {
		const bill = mockBills.find((b) => b.id === params.id);
		if (!bill) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(bill);
	}),

	http.post("/api/bills", async ({ request }) => {
		const body = (await request.json()) as Record<string, unknown>;
		const newBill = {
			id: `bill-${Date.now()}`,
			...body,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		return HttpResponse.json(newBill, { status: 201 });
	}),

	// Dashboard API
	http.get("/api/dashboard/summary", () => {
		return HttpResponse.json({
			totalTenants: mockTenants.length,
			totalProviders: mockProviders.length,
			totalBills: mockBills.length,
			pendingBills: mockBills.filter((b) => b.status === "pending").length,
			totalAmount: mockBills.reduce((sum, bill) => sum + bill.amount, 0),
		});
	}),
];
