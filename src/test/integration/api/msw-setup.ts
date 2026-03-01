import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

import { handlers } from "./msw-handlers";

// Setup MSW server for Node.js environment (integration tests)
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
