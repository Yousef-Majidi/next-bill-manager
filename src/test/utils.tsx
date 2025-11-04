import React, { ReactElement } from "react";

import { RenderOptions, render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</ThemeProvider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test data helpers
export const createMockTenant = (overrides = {}) => ({
	id: "test-tenant-id",
	name: "Test Tenant",
	email: "test@example.com",
	phone: "+1234567890",
	address: "123 Test St",
	createdAt: new Date("2024-01-01"),
	updatedAt: new Date("2024-01-01"),
	...overrides,
});

export const createMockProvider = (overrides = {}) => ({
	id: "test-provider-id",
	userId: "test-user-id",
	name: "Test Provider",
	category: "Electricity" as const,
	email: "test@example.com",
	website: "https://example.com",
	...overrides,
});

export const createMockBill = (overrides = {}) => ({
	id: "test-bill-id",
	tenantId: "test-tenant-id",
	providerId: "test-provider-id",
	amount: 100.0,
	dueDate: new Date("2024-02-01"),
	status: "pending",
	createdAt: new Date("2024-01-01"),
	updatedAt: new Date("2024-01-01"),
	...overrides,
});
