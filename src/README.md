# Next Bill Manager - Source Code

This directory contains the source code for the Next Bill Manager application, organized using a feature-based architecture.

## Architecture Overview

The application follows a **feature-based architecture** where code is organized around business features rather than technical concerns. This promotes:

- **Maintainability**: Related code is co-located
- **Scalability**: Easy to add new features without affecting existing ones
- **Team Collaboration**: Multiple developers can work on different features simultaneously
- **Code Reusability**: Features can be easily shared and reused

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
├── components/             # Legacy components (to be migrated)
├── context/               # React context providers
├── features/              # Feature-based modules
│   ├── auth/              # Authentication and user management
│   ├── bills/             # Bill management and processing
│   ├── dashboard/         # Dashboard and analytics
│   ├── email/             # Email processing and Gmail integration
│   ├── providers/         # Utility provider management
│   ├── shared/            # Shared utilities and hooks
│   ├── tenants/           # Tenant management
│   ├── README.md          # Feature documentation
│   ├── dependency-graph.md # Visual dependency graph
│   ├── naming-conventions.md # Naming conventions
│   └── index.ts           # Main feature exports
├── hooks/                 # Legacy hooks (to be migrated)
├── lib/                   # Shared libraries and utilities
├── pages/                 # Legacy pages (to be migrated)
├── states/                # Global state management
├── types/                 # Re-exports from features (backward compatibility)
└── README.md              # This file
```

## Key Concepts

### Feature-Based Organization

Each feature is self-contained with its own:

- **Types**: TypeScript interfaces and types
- **Components**: React components
- **Actions**: Server actions and business logic
- **Hooks**: React hooks for state management
- **Utils**: Utility functions

### Module Boundaries

Features have clear boundaries and dependencies:

- **Base Features**: Auth, Providers, Shared (no dependencies)
- **Level 1 Features**: Bills, Tenants (depend on base features)
- **Level 2 Features**: Dashboard, Email (depend on level 1 features)

### Barrel Exports

Each feature exports its public API through `index.ts` files:

```typescript
// Import from feature
import { UtilityBill, createBill } from "@/features/bills";
import { Tenant, TenantFormData } from "@/features/tenants";
```

## Development Workflow

### Adding New Code

1. **Identify the feature** the code belongs to
2. **Follow the naming conventions** defined in `features/naming-conventions.md`
3. **Place code in the appropriate subdirectory** (types, components, actions, etc.)
4. **Update barrel exports** in the feature's `index.ts` files
5. **Import from the feature** rather than individual files

### Migration Strategy

The codebase migration progress:

- ✅ **Phase 1**: Feature structure created
- ✅ **Phase 2**: Types moved to features
- ✅ **Phase 3**: Naming conventions implemented
- ✅ **Phase 4**: Imports updated throughout codebase
- ✅ **Phase 5**: Business logic extracted to features (Issue 16)
- 🔄 **Phase 6**: Moving components to features
- ⏳ **Phase 7**: Removing legacy files

### Import Guidelines

```typescript
// ✅ Correct - Import from feature
import { UtilityBill } from "@/features/bills";
import { useDialogState } from "@/features/shared";

// ❌ Incorrect - Deep import
import { UtilityBill } from "@/features/bills/types/bill";

// ❌ Incorrect - Legacy import
import { UtilityBill } from "@/types";
```

## Documentation

- **`features/README.md`**: Detailed feature documentation and boundaries
- **`features/dependency-graph.md`**: Visual dependency relationships
- **`features/naming-conventions.md`**: Naming conventions and standards

## Best Practices

1. **Feature Independence**: Keep features as independent as possible
2. **Clear Dependencies**: Document and maintain clear dependency relationships
3. **Consistent Naming**: Follow the established naming conventions
4. **Barrel Exports**: Always export through feature index files
5. **Type Safety**: Use TypeScript interfaces for all data structures
6. **Documentation**: Keep documentation up to date with code changes

## Getting Started

1. Read the feature documentation in `features/README.md`
2. Understand the naming conventions in `features/naming-conventions.md`
3. Review the dependency graph in `features/dependency-graph.md`
4. Follow the import guidelines when adding new code
5. Update documentation when making architectural changes
