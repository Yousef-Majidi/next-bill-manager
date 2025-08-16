# Feature Dependency Graph

```
┌─────────────┐    ┌─────────────┐
│   Auth      │    │ Providers   │
│  (User)     │    │(Utility)    │
└─────────────┘    └─────────────┘
       │                   │
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │   Bills     │
       │            │(UtilityBill)│
       │            └─────────────┘
       │                   │
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │   Email     │
       │            │(EmailContent)│
       │            └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│  Tenants    │    │ Dashboard   │
│  (Tenant)   │    │(Analytics)  │
└─────────────┘    └─────────────┘
       │                   ▲
       │                   │
       └───────────────────┘
```

## Dependency Details

### Base Features (No Dependencies)

- **Auth**: User authentication and management
- **Providers**: Utility provider definitions and categories

### Level 1 Dependencies

- **Bills**: Depends on Providers for utility provider information
- **Tenants**: Depends on Providers for utility categories

### Level 2 Dependencies

- **Email**: Depends on Bills for bill processing
- **Dashboard**: Depends on Bills, Tenants, and Providers for analytics

## Import Rules

1. **Base features** can be imported by any other feature
2. **Level 1 features** can import base features
3. **Level 2 features** can import base and level 1 features
4. **No circular dependencies** are allowed
5. **Features should not import from features at the same level** unless necessary

## Example Import Patterns

```typescript
// Base features (no imports needed)
export interface User { ... }
export interface UtilityProvider { ... }

// Level 1 features
import { UtilityProvider } from "@/features/providers";
export interface UtilityBill { ... }

// Level 2 features
import { UtilityBill } from "@/features/bills";
import { Tenant } from "@/features/tenants";
export interface DashboardData { ... }
```
