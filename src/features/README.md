# Feature Module Boundaries

This document defines the clear boundaries between different features in the application and their responsibilities.

## Feature Overview

### Bills Feature (`/bills`)

**Responsibility:** Bill management, consolidation, and processing

- **Types:** `UtilityBill`, `ConsolidatedBill`
- **Dependencies:** Providers (for utility provider information)
- **Exports:** Bill-related types, actions, and utilities

### Tenants Feature (`/tenants`)

**Responsibility:** Tenant management and share calculations

- **Types:** `Tenant`, `TenantFormData`
- **Dependencies:** Providers (for utility categories)
- **Exports:** Tenant-related types, actions, and utilities

### Providers Feature (`/providers`)

**Responsibility:** Utility provider management

- **Types:** `UtilityProvider`, `UtilityProviderCategory`, `UtilityProviderFormData`
- **Dependencies:** None (base feature)
- **Exports:** Provider types and utilities

### Dashboard Feature (`/dashboard`)

**Responsibility:** Dashboard components and analytics

- **Types:** Dashboard-specific types
- **Dependencies:** Bills, Tenants, Providers
- **Exports:** Dashboard components and utilities

### Auth Feature (`/auth`)

**Responsibility:** Authentication and user management

- **Types:** `User`
- **Dependencies:** None (base feature)
- **Exports:** User types and auth utilities

### Email Feature (`/email`)

**Responsibility:** Email processing and Gmail integration

- **Types:** `EmailContent`, `Payment`
- **Dependencies:** Bills (for bill processing)
- **Exports:** Email types and utilities

### Shared Feature (`/shared`)

**Responsibility:** Shared utilities and hooks used across features

- **Types:** `DialogType`
- **Dependencies:** None (base feature)
- **Exports:** Shared hooks and utilities

## Module Boundary Rules

### 1. Feature Independence

- Each feature should be as independent as possible
- Features should not directly import from other features' internal files
- Use the feature's public API (index.ts) for cross-feature communication

### 2. Dependency Direction

- **Providers**, **Auth**, and **Shared** are base features with no dependencies
- **Bills** depends on **Providers**
- **Tenants** depends on **Providers**
- **Dashboard** depends on **Bills**, **Tenants**, and **Providers**
- **Email** depends on **Bills**

### 3. Import Guidelines

- Always import from feature index files: `@/features/[feature-name]`
- Avoid deep imports: `@/features/[feature-name]/types/[specific-type]`
- Use barrel exports for clean imports

### 4. Shared Utilities

- Common utilities should be in `@/lib/common`
- Feature-specific utilities should be in the feature's `utils/` directory
- Avoid duplicating utilities across features

### 5. Type Sharing

- Types are exported through feature index files
- Legacy types are re-exported through `@/types` for backward compatibility
- New code should import from feature directories

## Example Usage

```typescript
// ✅ Correct - Import from feature index
import { UtilityBill, ConsolidatedBill } from "@/features/bills";
import { Tenant, TenantFormData } from "@/features/tenants";
import { UtilityProvider, UtilityProviderFormData } from "@/features/providers";
import { useDialogState, DialogType } from "@/features/shared";

// ❌ Incorrect - Deep import
import { UtilityBill } from "@/features/bills/types/bill";

// ❌ Incorrect - Import from old location
import { UtilityBill } from "@/types";
```

## Migration Strategy

1. **Phase 1:** ✅ Feature structure created
2. **Phase 2:** ✅ Types moved to features
3. **Phase 3:** ✅ Naming conventions implemented
4. **Phase 4:** Update imports throughout codebase
5. **Phase 5:** Move components to features
6. **Phase 6:** Move actions and utilities to features
7. **Phase 7:** Remove legacy files

## File Structure

Each feature follows this structure:

```
src/features/[feature-name]/
├── components/          # React components
│   └── index.ts        # Component exports
├── types/              # TypeScript types
│   └── index.ts        # Type exports
├── actions/            # Server actions
│   └── index.ts        # Action exports
├── hooks/              # React hooks
│   └── index.ts        # Hook exports
├── utils/              # Utility functions
│   └── index.ts        # Utility exports
└── index.ts            # Feature exports
```

## Development Guidelines

### Adding New Features

1. Create the feature directory structure
2. Define types in the `types/` directory
3. Create components in the `components/` directory
4. Add actions in the `actions/` directory
5. Create hooks in the `hooks/` directory
6. Add utilities in the `utils/` directory
7. Update barrel exports in all `index.ts` files
8. Update the main features index
9. Update this documentation

### Adding New Types

1. Create the type file in the appropriate feature's `types/` directory
2. Follow the naming conventions (PascalCase for interfaces)
3. Export the type from the feature's types index
4. Update imports throughout the codebase

### Cross-Feature Dependencies

1. Identify which feature the dependency belongs to
2. Import from the feature's public API (index.ts)
3. Avoid creating circular dependencies
4. Document the dependency in this README
