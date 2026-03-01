# Naming Conventions

This document defines consistent naming conventions across the application.

## File Naming

### Feature Files

- **Components**: `kebab-case.tsx` (e.g., `add-tenant-dialog.tsx`)
- **Types**: `kebab-case.ts` (e.g., `utility-bill.ts`)
- **Actions**: `kebab-case.ts` (e.g., `bill-actions.ts`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-dialog-state.ts`)
- **Utils**: `kebab-case.ts` (e.g., `bill-utils.ts`)

### Directories

- **Features**: `kebab-case` (e.g., `utility-bills`)
- **Components**: `kebab-case` (e.g., `add-tenant-dialog`)
- **Types**: `kebab-case` (e.g., `bill-types`)

## Type Naming

### Interfaces

- **PascalCase** with descriptive names
- **Entity interfaces**: `EntityName` (e.g., `UtilityBill`, `Tenant`)
- **Form data interfaces**: `EntityNameFormData` (e.g., `TenantFormData`)
- **Component props**: `ComponentNameProps` (e.g., `AddTenantDialogProps`)

### Enums

- **PascalCase** with descriptive names
- **Category enums**: `EntityNameCategory` (e.g., `UtilityProviderCategory`)
- **Status enums**: `EntityNameStatus` (e.g., `BillStatus`)
- **Type enums**: `EntityNameType` (e.g., `DialogType`)

### Type Aliases

- **PascalCase** with descriptive names
- **Schema types**: `EntityNameSchema` (e.g., `TenantFormSchema`)
- **Utility types**: `DescriptiveName` (e.g., `NullableId`)

## Function Naming

### Actions (Server Actions)

- **camelCase** with verb prefixes
- **CRUD operations**: `createEntity`, `readEntity`, `updateEntity`, `deleteEntity`
- **Business logic**: `processEntity`, `validateEntity`, `transformEntity`

### Hooks

- **camelCase** with `use` prefix
- **State hooks**: `useEntityState` (e.g., `useDialogState`)
- **Data hooks**: `useEntityData` (e.g., `useTenantData`)
- **Action hooks**: `useEntityActions` (e.g., `useBillActions`)

### Utilities

- **camelCase** with descriptive names
- **Transformers**: `transformEntity` (e.g., `transformBill`)
- **Validators**: `validateEntity` (e.g., `validateTenant`)
- **Formatters**: `formatEntity` (e.g., `formatCurrency`)

## Component Naming

### React Components

- **PascalCase** with descriptive names
- **Page components**: `EntityNamePage` (e.g., `TenantsPage`)
- **Dialog components**: `ActionEntityNameDialog` (e.g., `AddTenantDialog`)
- **Section components**: `EntityNameSection` (e.g., `BillBreakdownSection`)
- **Card components**: `EntityNameCard` (e.g., `StatCard`)

### Component Files

- **kebab-case.tsx** matching component name
- **Index files**: `index.ts` for barrel exports

## Variable Naming

### Constants

- **UPPER_SNAKE_CASE** for true constants
- **camelCase** for configuration objects

### Variables

- **camelCase** with descriptive names
- **Boolean variables**: `isEntityState` (e.g., `isDialogOpen`)
- **Array variables**: `entityList` or `entities` (e.g., `tenantList`)
- **Object variables**: `entityData` (e.g., `billData`)

## Import/Export Naming

### Barrel Exports

- **Index files**: Export all public APIs
- **Feature exports**: Export from feature root
- **Type exports**: Export types from feature types

### Import Organization

1. **React/Next.js imports**
2. **Third-party library imports**
3. **Internal feature imports** (`@/features/...`)
4. **Internal utility imports** (`@/lib/...`)
5. **Relative imports** (`./` or `../`)

## Examples

### ✅ Correct Naming

```typescript
// File: src/features/tenants/components/add-tenant-dialog.tsx
export interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTenantDialog: React.FC<AddTenantDialogProps> = ({ isOpen, onClose }) => {
  const { tenantData, isDialogOpen } = useTenantState();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Dialog content */}
    </Dialog>
  );
};

// File: src/features/tenants/actions/tenant-actions.ts
export const createTenant = async (tenantData: TenantFormData): Promise<Tenant> => {
  // Implementation
};

// File: src/features/tenants/hooks/use-tenant-state.ts
export const useTenantState = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return { isDialogOpen, setIsDialogOpen };
};
```

### ❌ Incorrect Naming

```typescript
// Wrong file naming
export const AddTenantDialog = () => {}; // File should be add-tenant-dialog.tsx

// Wrong interface naming
export interface props {} // Should be AddTenantDialogProps

// Wrong function naming
export const add_tenant = () => {}; // Should be addTenant

// Wrong variable naming
const dialog_open = false; // Should be isDialogOpen
```
