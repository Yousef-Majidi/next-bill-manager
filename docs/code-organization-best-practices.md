# Code Organization Best Practices

## Table of Contents

1. [Introduction](#introduction)
2. [Feature-Based Architecture](#feature-based-architecture)
3. [File and Directory Naming](#file-and-directory-naming)
4. [Component Organization](#component-organization)
5. [State Management](#state-management)
6. [Import/Export Patterns](#importexport-patterns)
7. [Type Safety](#type-safety)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategies](#testing-strategies)
10. [Code Review Guidelines](#code-review-guidelines)
11. [Common Anti-Patterns](#common-anti-patterns)
12. [Migration Strategies](#migration-strategies)

## Introduction

This guide provides comprehensive best practices for organizing code in the Next Bill Manager application. Following these practices ensures maintainability, scalability, and consistency across the codebase.

### Core Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Feature Isolation**: Features are self-contained with minimal cross-dependencies
3. **Consistency**: Uniform patterns and conventions across the codebase
4. **Maintainability**: Code is easy to understand, modify, and extend
5. **Performance**: Efficient patterns that don't compromise code quality

## Feature-Based Architecture

### Feature Structure

Each feature should follow this consistent structure:

```
features/[feature-name]/
├── actions/                    # Server actions and API calls
│   ├── index.ts               # Barrel exports
│   ├── create.ts              # Create operations
│   ├── read.ts                # Read operations
│   ├── update.ts              # Update operations
│   └── delete.ts              # Delete operations
├── components/                 # Feature-specific components
│   ├── index.ts               # Barrel exports
│   ├── [ComponentName].tsx    # React components
│   └── [ComponentName].test.tsx # Component tests
├── hooks/                      # Feature-specific hooks
│   ├── index.ts               # Barrel exports
│   ├── use[HookName].ts       # Custom hooks
│   └── use[HookName].test.ts  # Hook tests
├── types/                      # Feature-specific types
│   ├── index.ts               # Barrel exports
│   ├── [TypeName].ts          # Type definitions
│   └── [TypeName].test.ts     # Type validation tests
├── utils/                      # Feature-specific utilities
│   ├── index.ts               # Barrel exports
│   ├── [utilityName].ts       # Utility functions
│   └── [utilityName].test.ts  # Utility tests
└── index.ts                    # Feature barrel exports
```

### Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Clear feature structure
features/bills/
├── actions/
│   ├── index.ts
│   ├── createBill.ts
│   └── getBills.ts
├── components/
│   ├── index.ts
│   ├── BillList.tsx
│   └── BillCard.tsx
└── index.ts

// ✅ Good: Proper barrel exports
// features/bills/index.ts
export * from './actions';
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Mixed concerns in single file
// features/bills/bills.ts
export function createBill() { /* ... */ }
export function BillList() { /* ... */ }
export interface Bill { /* ... */ }

// ❌ Bad: Inconsistent structure
features/bills/
├── billActions.ts
├── billComponents.tsx
└── billTypes.ts
```

## File and Directory Naming

### Naming Conventions

| Type            | Convention | Example                  |
| --------------- | ---------- | ------------------------ |
| Directories     | kebab-case | `feature-name/`          |
| Component files | PascalCase | `ComponentName.tsx`      |
| Utility files   | camelCase  | `utilityName.ts`         |
| Test files      | camelCase  | `componentName.test.tsx` |
| Type files      | camelCase  | `typeName.ts`            |

### Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Descriptive component names
components / bills / BillList.tsx;
components / bills / BillCard.tsx;
components / bills / BillFilters.tsx;

// ✅ Good: Clear utility names
utils / formatCurrency.ts;
utils / validateEmail.ts;
utils / calculateTotal.ts;

// ✅ Good: Descriptive type names
types / BillData.ts;
types / UserProfile.ts;
types / ApiResponse.ts;
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Generic names
components / List.tsx;
components / Card.tsx;
utils / helper.ts;
types / data.ts;

// ❌ Bad: Inconsistent casing
components / bill - list.tsx;
components / BillCard.tsx;
utils / format - currency.ts;
```

## Component Organization

### Component Structure

#### Presentational Components

```typescript
// ✅ Good: Presentational component
interface BillCardProps {
  bill: Bill;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function BillCard({
  bill,
  onEdit,
  onDelete,
  isLoading = false
}: BillCardProps) {
  if (isLoading) {
    return <BillCardSkeleton />;
  }

  return (
    <div className="bill-card">
      <h3>{bill.title}</h3>
      <p>{bill.amount}</p>
      <div className="actions">
        <button onClick={() => onEdit(bill.id)}>Edit</button>
        <button onClick={() => onDelete(bill.id)}>Delete</button>
      </div>
    </div>
  );
}
```

#### Container Components

```typescript
// ✅ Good: Container component
export function BillsContainer() {
  const { bills, isLoading, error, actions } = useBills();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bills-container">
      <BillList
        bills={bills}
        isLoading={isLoading}
        onEdit={actions.editBill}
        onDelete={actions.deleteBill}
      />
    </div>
  );
}
```

### Component Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Single responsibility
export function BillAmount({ amount, currency }: BillAmountProps) {
  return <span>{formatCurrency(amount, currency)}</span>;
}

// ✅ Good: Proper prop interfaces
interface ComponentProps {
  data: ComponentData;
  onAction: (data: ActionData) => void;
  isLoading?: boolean;
  error?: string;
}

// ✅ Good: Default props
export function Component({
  data,
  onAction,
  isLoading = false,
  error
}: ComponentProps) {
  // Component implementation
}
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Multiple responsibilities
export function BillCard({ bill }: { bill: Bill }) {
	// Handles display, editing, deletion, and API calls
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState(bill);

	const handleSubmit = async () => {
		await updateBill(bill.id, formData);
		setIsEditing(false);
	};

	// Too much logic in one component
}

// ❌ Bad: Inline types
export function Component({ data, onAction }: any) {
	// No type safety
}
```

## State Management

### State Organization

#### Global State

```typescript
// ✅ Good: Global state structure
interface AppState {
	user: UserState;
	app: AppSettings;
	ui: UIState;
}

interface UserState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AppSettings {
	theme: "light" | "dark";
	language: string;
	notifications: Notification[];
}
```

#### Feature State

```typescript
// ✅ Good: Feature-specific state
interface BillsState {
	bills: Bill[];
	selectedBill: Bill | null;
	filters: BillFilters;
	isLoading: boolean;
	error: string | null;
}

// ✅ Good: State management with hooks
export function useBills() {
	const [state, setState] = useState<BillsState>({
		bills: [],
		selectedBill: null,
		filters: {},
		isLoading: false,
		error: null,
	});

	const actions = {
		loadBills: async () => {
			setState((prev) => ({ ...prev, isLoading: true }));
			try {
				const bills = await fetchBills();
				setState((prev) => ({ ...prev, bills, isLoading: false }));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error.message,
					isLoading: false,
				}));
			}
		},

		selectBill: (bill: Bill) => {
			setState((prev) => ({ ...prev, selectedBill: bill }));
		},
	};

	return { ...state, actions };
}
```

### State Management Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Immutable state updates
const updateBill = (billId: string, updates: Partial<Bill>) => {
	setBills((prev) =>
		prev.map((bill) => (bill.id === billId ? { ...bill, ...updates } : bill)),
	);
};

// ✅ Good: Derived state
const totalAmount = useMemo(
	() => bills.reduce((sum, bill) => sum + bill.amount, 0),
	[bills],
);

// ✅ Good: Error boundaries
class ErrorBoundary extends React.Component {
	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error and show fallback UI
	}
}
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Mutable state updates
const updateBill = (billId: string, updates: Partial<Bill>) => {
	const bill = bills.find((b) => b.id === billId);
	if (bill) {
		Object.assign(bill, updates); // Mutates state directly
	}
};

// ❌ Bad: Complex state in components
function Component() {
	const [data, setData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({});
	// Too much local state
}
```

## Import/Export Patterns

### Barrel Exports

#### ✅ Good: Proper barrel exports

```typescript
// features/bills/actions/index.ts
export { createBill } from "./createBill";
export { getBills } from "./getBills";
export { updateBill } from "./updateBill";
export { deleteBill } from "./deleteBill";

// features/bills/components/index.ts
export { BillList } from "./BillList";
export { BillCard } from "./BillCard";
export { BillFilters } from "./BillFilters";

// features/bills/index.ts
export * from "./actions";
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./utils";
```

### Import Patterns

#### ✅ Do's

```typescript
// ✅ Good: Absolute imports
import { Button, Card } from "@/components/ui";
import { BillCard, BillList } from "@/features/bills";
// ✅ Good: Named imports
import { createBill, getBills } from "@/features/bills/actions";
import { useBills } from "@/features/bills/hooks";
// ✅ Good: Type imports
import type { Bill, CreateBillData } from "@/features/bills/types";
import { formatCurrency } from "@/lib/utils";
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Relative imports
import { BillList } from '../../../features/bills/components/BillList';
import { createBill } from './actions/createBill';

// ❌ Bad: Default imports for named exports
import Bills from '@/features/bills'; // Should be named import

// ❌ Bad: Mixed import styles
import { BillList } from '@/features/bills';
import createBill from '@/features/bills/actions/createBill';
```

## Type Safety

### Type Definitions

#### ✅ Good: Comprehensive types

```typescript
// types/bill.ts
export interface Bill {
	id: string;
	title: string;
	amount: number;
	currency: string;
	dueDate: Date;
	status: "paid" | "pending" | "overdue";
	tenantId: string;
	providerId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateBillData {
	title: string;
	amount: number;
	currency: string;
	dueDate: Date;
	tenantId: string;
	providerId: string;
}

export interface BillFilters {
	status?: Bill["status"];
	tenantId?: string;
	providerId?: string;
	dateRange?: {
		start: Date;
		end: Date;
	};
}

// Type guards
export function isBill(obj: unknown): obj is Bill {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"amount" in obj
	);
}
```

### Type Safety Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Strict typing
function processBill(bill: Bill): ProcessedBill {
	return {
		...bill,
		formattedAmount: formatCurrency(bill.amount, bill.currency),
		isOverdue: new Date() > bill.dueDate && bill.status !== "paid",
	};
}

// ✅ Good: Generic types
interface ApiResponse<T> {
	data: T;
	status: "success" | "error";
	message?: string;
}

// ✅ Good: Union types
type BillStatus = "paid" | "pending" | "overdue";
type Currency = "USD" | "EUR" | "GBP";
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Any types
function processBill(bill: any): any {
	return {
		...bill,
		formattedAmount: formatCurrency(bill.amount, bill.currency),
	};
}

// ❌ Bad: Loose typing
interface Bill {
	id: string;
	title: string;
	amount: number;
	[key: string]: any; // Avoid index signatures
}
```

## Performance Optimization

### Code Splitting

#### ✅ Good: Dynamic imports

```typescript
// ✅ Good: Route-based code splitting
const BillsPage = dynamic(() => import('@/features/bills'), {
  loading: () => <BillsPageSkeleton />,
  ssr: false
});

// ✅ Good: Component-based code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <ComponentSkeleton />
});
```

### Memoization

#### ✅ Good: Proper memoization

```typescript
// ✅ Good: Memoized components
export const BillCard = React.memo(function BillCard({
  bill,
  onEdit,
  onDelete
}: BillCardProps) {
  return (
    <div className="bill-card">
      <h3>{bill.title}</h3>
      <p>{bill.amount}</p>
      <div className="actions">
        <button onClick={() => onEdit(bill.id)}>Edit</button>
        <button onClick={() => onDelete(bill.id)}>Delete</button>
      </div>
    </div>
  );
});

// ✅ Good: Memoized values
const expensiveValue = useMemo(() => {
  return bills.reduce((sum, bill) => sum + bill.amount, 0);
}, [bills]);

// ✅ Good: Memoized callbacks
const handleEdit = useCallback((id: string) => {
  onEdit(id);
}, [onEdit]);
```

### Performance Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Efficient rendering
function BillList({ bills }: { bills: Bill[] }) {
  return (
    <div className="bill-list">
      {bills.map(bill => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </div>
  );
}

// ✅ Good: Proper key usage
{bills.map(bill => (
  <BillCard key={bill.id} bill={bill} />
))}

// ✅ Good: Lazy loading
const LazyComponent = lazy(() => import('./LazyComponent'));
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Inefficient rendering
function BillList({ bills }: { bills: Bill[] }) {
  return (
    <div className="bill-list">
      {bills.map((bill, index) => (
        <BillCard key={index} bill={bill} /> // Bad key
      ))}
    </div>
  );
}

// ❌ Bad: Unnecessary re-renders
function Component({ data }: { data: Data[] }) {
  const processedData = data.map(item => ({
    ...item,
    processed: expensiveOperation(item)
  })); // Recalculates on every render
}
```

## Testing Strategies

### Test Organization

```
src/
├── __tests__/                    # Global test utilities
├── features/
│   └── [feature]/
│       ├── __tests__/            # Feature-specific tests
│       │   ├── components/       # Component tests
│       │   ├── hooks/           # Hook tests
│       │   ├── utils/           # Utility tests
│       │   └── integration/     # Integration tests
│       └── ...
└── ...
```

### Testing Patterns

#### ✅ Good: Component tests

```typescript
// ✅ Good: Component test
describe('BillCard', () => {
  const mockBill: Bill = {
    id: '1',
    title: 'Test Bill',
    amount: 100,
    currency: 'USD',
    dueDate: new Date(),
    status: 'pending',
    tenantId: 'tenant1',
    providerId: 'provider1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders bill information correctly', () => {
    render(<BillCard bill={mockBill} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Test Bill')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<BillCard bill={mockBill} onEdit={onEdit} onDelete={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

#### ✅ Good: Hook tests

```typescript
// ✅ Good: Hook test
describe("useBills", () => {
	it("loads bills successfully", async () => {
		const mockBills = [mockBill];
		jest.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: true,
			json: async () => mockBills,
		} as Response);

		const { result } = renderHook(() => useBills());

		await act(async () => {
			await result.current.actions.loadBills();
		});

		expect(result.current.bills).toEqual(mockBills);
		expect(result.current.isLoading).toBe(false);
	});
});
```

### Testing Best Practices

#### ✅ Do's

```typescript
// ✅ Good: Descriptive test names
it("should display error message when API call fails", async () => {
	// Test implementation
});

// ✅ Good: Proper setup and teardown
beforeEach(() => {
	jest.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

// ✅ Good: Mock external dependencies
jest.mock("@/lib/api", () => ({
	fetchBills: jest.fn(),
}));
```

#### ❌ Don'ts

```typescript
// ❌ Bad: Vague test names
it('works', () => {
  // Test implementation
});

// ❌ Bad: Testing implementation details
it('calls setState with correct arguments', () => {
  // Don't test internal state management
});

// ❌ Bad: No cleanup
it('renders component', () => {
  render(<Component />);
  // No cleanup
});
```

## Code Review Guidelines

### Review Checklist

#### Structure and Organization

- [ ] Does the code follow the feature-based structure?
- [ ] Are files and directories named consistently?
- [ ] Are barrel exports implemented correctly?
- [ ] Is the component hierarchy logical?

#### Code Quality

- [ ] Are TypeScript types properly defined?
- [ ] Are there any `any` types or type assertions?
- [ ] Are components properly typed with interfaces?
- [ ] Is error handling implemented?

#### Performance

- [ ] Are components memoized when appropriate?
- [ ] Are expensive calculations memoized?
- [ ] Are event handlers memoized?
- [ ] Is code splitting implemented for large components?

#### Testing

- [ ] Are new components tested?
- [ ] Are new utilities tested?
- [ ] Are edge cases covered?
- [ ] Are tests descriptive and maintainable?

### Review Comments

#### ✅ Good: Constructive feedback

```typescript
// ✅ Good: Specific and actionable
// Consider extracting this logic into a custom hook for reusability
// The component is handling too many responsibilities

// ✅ Good: Suggesting improvements
// This could be optimized with useMemo to prevent unnecessary recalculations
// Consider using a more specific type instead of 'any'
```

#### ❌ Bad: Unhelpful feedback

```typescript
// ❌ Bad: Vague feedback
// This doesn't look right
// Fix this

// ❌ Bad: Personal opinions
// I don't like this approach
// This is wrong
```

## Common Anti-Patterns

### ❌ Avoid These Patterns

#### 1. God Components

```typescript
// ❌ Bad: Component doing too much
function BillsPage() {
	const [bills, setBills] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({});
	const [selectedBill, setSelectedBill] = useState(null);

	// API calls, form handling, filtering, sorting, etc.
	// Too many responsibilities
}
```

#### 2. Prop Drilling

```typescript
// ❌ Bad: Passing props through multiple levels
function App() {
  const [user, setUser] = useState(null);

  return (
    <Layout user={user}>
      <Sidebar user={user}>
        <Navigation user={user}>
          <UserMenu user={user} />
        </Navigation>
      </Sidebar>
    </Layout>
  );
}
```

#### 3. Inline Styles and Logic

```typescript
// ❌ Bad: Inline styles and complex logic
function Component() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: isLoading ? '#f0f0f0' : '#ffffff'
    }}>
      {data.map(item => (
        <div key={item.id}>
          {item.type === 'bill' ? (
            <BillCard bill={item} />
          ) : item.type === 'tenant' ? (
            <TenantCard tenant={item} />
          ) : (
            <ProviderCard provider={item} />
          )}
        </div>
      ))}
    </div>
  );
}
```

#### 4. Magic Numbers and Strings

```typescript
// ❌ Bad: Magic numbers and strings
function Component() {
  const items = data.filter(item => item.status === 'active');
  const maxItems = 10;
  const timeout = 5000;

  return (
    <div>
      {items.slice(0, maxItems).map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### ✅ Better Alternatives

#### 1. Split Components

```typescript
// ✅ Good: Split into smaller components
function BillsPage() {
  const { bills, isLoading, error, actions } = useBills();

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bills-page">
      <BillsHeader />
      <BillsFilters onFilter={actions.filterBills} />
      <BillsList
        bills={bills}
        isLoading={isLoading}
        onEdit={actions.editBill}
        onDelete={actions.deleteBill}
      />
    </div>
  );
}
```

#### 2. Use Context or State Management

```typescript
// ✅ Good: Use context for shared state
const UserContext = createContext<User | null>(null);

function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={user}>
      <Layout>
        <Sidebar>
          <Navigation>
            <UserMenu />
          </Navigation>
        </Sidebar>
      </Layout>
    </UserContext.Provider>
  );
}
```

#### 3. Extract Styles and Logic

```typescript
// ✅ Good: Extract styles and logic
const CONFIG = {
  MAX_ITEMS: 10,
  TIMEOUT: 5000,
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }
} as const;

function Component() {
  const activeItems = useMemo(() =>
    data.filter(item => item.status === CONFIG.STATUS.ACTIVE),
    [data]
  );

  return (
    <div className="component">
      {activeItems.slice(0, CONFIG.MAX_ITEMS).map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Migration Strategies

### Incremental Migration

#### Phase 1: Structure Setup

1. Create feature directories
2. Move existing code to appropriate features
3. Implement barrel exports
4. Update imports

#### Phase 2: Type Safety

1. Add TypeScript interfaces
2. Remove `any` types
3. Implement type guards
4. Add proper error handling

#### Phase 3: Performance

1. Implement memoization
2. Add code splitting
3. Optimize bundle size
4. Add performance monitoring

#### Phase 4: Testing

1. Add unit tests
2. Add integration tests
3. Add E2E tests
4. Implement test coverage

### Migration Checklist

- [ ] Create feature-based directory structure
- [ ] Move existing components to features
- [ ] Implement barrel exports
- [ ] Update all imports to use absolute paths
- [ ] Add TypeScript interfaces
- [ ] Remove `any` types
- [ ] Add proper error handling
- [ ] Implement memoization where needed
- [ ] Add code splitting for large components
- [ ] Write tests for new structure
- [ ] Update documentation
- [ ] Run validation scripts

### Rollback Plan

1. Keep original code in separate branch
2. Test thoroughly before merging
3. Have rollback scripts ready
4. Monitor performance after migration
5. Gather feedback from team

## Conclusion

Following these best practices ensures a maintainable, scalable, and consistent codebase. The key is to:

1. **Start with structure**: Implement feature-based architecture
2. **Focus on types**: Use TypeScript effectively
3. **Optimize performance**: Implement proper memoization and code splitting
4. **Test thoroughly**: Write comprehensive tests
5. **Review regularly**: Maintain code quality through reviews
6. **Document everything**: Keep documentation up to date

Remember that these practices are guidelines, not strict rules. Adapt them to your specific needs while maintaining consistency across the codebase.
