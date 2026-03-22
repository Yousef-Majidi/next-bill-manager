# Contributing Guidelines

## Overview

This document outlines the development standards and contribution process for the Next Bill Manager application.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 10.11.0+
- Git
- Code editor with TypeScript support

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd next-bill-manager
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run validation scripts**
   ```bash
   pnpm validate-all
   ```

## Code Organization Standards

### Directory Structure

```
next-bill-manager/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Shared UI components
│   ├── features/               # Feature-based modules
│   ├── lib/                    # Utility libraries and configurations
│   ├── hooks/                  # Shared React hooks
│   ├── states/                 # Global state management
│   └── types/                  # Global TypeScript types
├── scripts/                    # Build and validation scripts
└── docs/                       # Documentation
```

### Feature Structure

Each feature should follow a modular structure, creating directories only as needed:

```
features/[feature-name]/
├── actions/                     # (Optional) Server actions and API calls
├── components/                  # (Optional) Feature-specific components
├── hooks/                       # (Optional) Feature-specific hooks
├── types/                       # (Optional) Feature-specific types
├── utils/                       # (Optional) Feature-specific utilities
└── index.ts                     # (Optional) Feature exports
```

### Module Boundaries

- **Feature Isolation**: Each feature should be self-contained
- **Dependency Rules**: Features can depend on shared modules, not other features
- **Absolute Imports**: Use `@/` prefix for better maintainability

## Naming Conventions

### Files and Directories

| Type            | Convention | Example                  |
| --------------- | ---------- | ------------------------ |
| Directories     | kebab-case | `feature-name/`          |
| Component files | PascalCase | `ComponentName.tsx`      |
| Utility files   | camelCase  | `utilityName.ts`         |
| Test files      | camelCase  | `componentName.test.tsx` |
| Type files      | camelCase  | `typeName.ts`            |

### Components

- Use PascalCase for component names
- Suffix component files with `.tsx`
- Use descriptive names that indicate functionality

### Types and Interfaces

- Use PascalCase for type and interface names
- Use descriptive names that indicate the data structure

### Functions and Variables

- Use camelCase for function and variable names
- Use descriptive names that clearly indicate purpose
- Avoid abbreviations unless widely understood

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` type - use proper type definitions
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Implement proper error handling with typed errors

### React Components

- Use functional components with hooks
- Implement proper prop interfaces
- Use React.memo for performance optimization when needed
- Separate presentation and logic
- Use custom hooks for complex logic

### Code Quality

- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Implement proper error handling
- Follow consistent formatting

### Performance

- Implement proper memoization
- Use lazy loading for large components
- Optimize bundle size
- Implement proper caching strategies
- Avoid unnecessary re-renders

## Testing Guidelines

### Testing Strategy

Follow the testing pyramid:

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Feature interactions
3. **End-to-End Tests**: Complete user workflows

### Test Patterns

```typescript
// Component testing
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});

// Hook testing
describe('useHookName', () => {
  it('returns expected data', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.data).toBeDefined();
  });
});
```

### Test Coverage

- **Minimum 70% test coverage** (enforced by quality gates)
- Test happy path and error scenarios
- Test edge cases and boundary conditions
- Mock external dependencies appropriately
- Use Vitest with V8 coverage provider
- Generate coverage reports: `pnpm test:coverage:html`

## Code Review Process

### Review Checklist

- [ ] Code follows project conventions
- [ ] All tests pass with 70%+ coverage
- [ ] Quality gates pass (`pnpm run quality-gate:full`)
- [ ] No linting errors
- [ ] Proper error handling implemented
- [ ] Performance considerations addressed
- [ ] Security considerations addressed
- [ ] Documentation updated if needed
- [ ] Version management considered (if applicable)

### Review Guidelines

1. **Be constructive**: Provide helpful feedback
2. **Focus on code**: Avoid personal criticism
3. **Explain reasoning**: Why changes are suggested
4. **Suggest alternatives**: Provide specific solutions
5. **Check for security**: Review for potential vulnerabilities

## Common Patterns

### Action Patterns

```typescript
// Server actions
export async function createResource(data: CreateResourceData) {
	try {
		// Validate input
		const validatedData = createResourceSchema.parse(data);

		// Perform operation
		const result = await performOperation(validatedData);

		// Return success response
		return { success: true, data: result };
	} catch (error) {
		// Handle errors appropriately
		console.error("Error creating resource:", error);
		return { success: false, error: error.message };
	}
}
```

### Hook Patterns

```typescript
// Custom hooks
export function useResource() {
	const [data, setData] = useState<Resource[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await getResources();
			setData(result);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, isLoading, error, refetch: fetchData };
}
```

### Component Patterns

```typescript
// Presentational component
interface ComponentProps {
  data: DataType;
  onAction: (action: ActionType) => void;
  isLoading?: boolean;
  error?: string;
}

export function Component({ data, onAction, isLoading, error }: ComponentProps) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="component">
      {/* Component content */}
    </div>
  );
}
```

## Migration Guidelines

### When Adding New Features

1. Create feature directory in `src/features/`
2. Follow the standard feature structure
3. Add proper TypeScript types
4. Write tests for new functionality
5. Update documentation

### When Refactoring

1. Maintain backward compatibility
2. Update all related imports
3. Update tests
4. Update documentation
5. Test thoroughly

### When Removing Features

1. Remove all related files
2. Update imports and exports
3. Clean up dependencies
4. Update documentation
5. Test for regressions

## Quality Gates and Testing

### Quality Gate System

The project implements comprehensive quality gates:

- **Quality Check**: `pnpm run quality-check` - Linting, tests, and validation
- **Quality Gate**: `pnpm run quality-gate` - Quality gate checks
- **Full Quality Gate**: `pnpm run quality-gate:full` - Complete quality gate with build

### Testing Infrastructure

- **Test Runner**: Vitest with V8 coverage provider
- **Coverage Threshold**: 70% minimum (enforced by quality gates)
- **Coverage Reports**: HTML, JSON, and LCOV formats
- **Test Commands**:
  - `pnpm test` - Run tests with UI
  - `pnpm test:run` - Run tests in CI mode
  - `pnpm test:coverage` - Generate coverage report
  - `pnpm test:coverage:html` - Generate HTML coverage report

### CI/CD Integration

- **GitHub Actions**: Automated testing and deployment
- **Quality Gates**: Enforced in CI pipeline
- **Coverage Reporting**: Integrated with Codecov
- **Automated Releases**: Version management and deployment

## Validation and Automation

### Available Scripts

- `pnpm validate-all` - Validate feature dependencies
- `pnpm check-dependencies` - Validate feature dependencies

### Linting Rules

- ESLint configuration for code quality
- Prettier for consistent formatting
- Custom rules for project-specific patterns
- Automated enforcement in CI/CD

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

- Ensures code quality standards
- Prevents commits with linting errors

## Commit Guidelines

### Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(bills): add bill creation functionality
fix(auth): resolve authentication token issue
docs(readme): update setup instructions
refactor(components): extract reusable button component
test(hooks): add tests for useBills hook
chore(deps): update dependencies
```

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `docs/document-name` - Documentation updates

---

Following these guidelines ensures the Next Bill Manager application maintains high code quality, consistency, and maintainability. Thank you for contributing!
