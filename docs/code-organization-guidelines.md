# Code Organization Guidelines

## Overview

This document outlines the code organization structure and guidelines for the Next Bill Manager application. The project follows a feature-based architecture with clear module boundaries and consistent naming conventions.

## Directory Structure

### Root Level

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

Each feature follows a consistent structure:

```
features/[feature-name]/
├── actions/                    # Server actions and API calls
├── components/                 # Feature-specific components
├── hooks/                      # Feature-specific hooks
├── types/                      # Feature-specific types
├── utils/                      # Feature-specific utilities
└── index.ts                    # Barrel exports
```

## Naming Conventions

### Files and Directories

- Use kebab-case for file and directory names
- Use PascalCase for component files
- Use camelCase for utility files
- Use descriptive names that clearly indicate purpose

### Components

- Use PascalCase for component names
- Suffix component files with `.tsx`
- Use descriptive names that indicate functionality

### Types and Interfaces

- Use PascalCase for type and interface names
- Prefix interfaces with `I` when needed for clarity
- Use descriptive names that indicate the data structure

### Functions and Variables

- Use camelCase for function and variable names
- Use descriptive names that clearly indicate purpose
- Avoid abbreviations unless widely understood

## Module Boundaries

### Feature Isolation

- Each feature should be self-contained
- Features should not directly import from other features
- Use shared modules for common functionality
- Implement clear interfaces between features

### Import/Export Guidelines

- Use barrel exports (`index.ts`) for clean imports
- Export only what is necessary
- Use absolute imports for better maintainability
- Avoid circular dependencies

### Dependency Management

- Features can depend on shared modules
- Shared modules should not depend on features
- Use dependency injection for cross-feature communication
- Implement clear contracts between modules

## Code Organization Rules

### File Organization

- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent file structure within features
- Maintain logical file ordering

### Component Structure

- Separate presentation and logic
- Use custom hooks for complex logic
- Keep components small and focused
- Implement proper prop interfaces

### State Management

- Use local state for component-specific data
- Use global state for shared application data
- Implement proper state updates
- Avoid prop drilling

## Best Practices

### Code Quality

- Write self-documenting code
- Use TypeScript for type safety
- Implement proper error handling
- Follow consistent formatting

### Performance

- Implement proper memoization
- Use lazy loading for large components
- Optimize bundle size
- Implement proper caching strategies

### Testing

- Write unit tests for utilities
- Write integration tests for features
- Test error scenarios
- Maintain good test coverage

### Documentation

- Document complex logic
- Maintain up-to-date README files
- Use JSDoc for public APIs
- Document architectural decisions

## Validation and Automation

### Linting Rules

- ESLint configuration for code quality
- Prettier for consistent formatting
- Custom rules for project-specific patterns
- Automated enforcement in CI/CD

### Build Scripts

- Validation scripts for code organization
- Dependency checking
- Barrel export validation
- Feature structure validation

### CI/CD Integration

- Automated code quality checks
- Build validation
- Test execution
- Deployment automation

## Migration Guidelines

### When Adding New Features

1. Create feature directory in `src/features/`
2. Follow the standard feature structure
3. Implement barrel exports
4. Add proper TypeScript types
5. Update documentation

### When Refactoring

1. Maintain backward compatibility
2. Update all related imports
3. Update documentation
4. Run validation scripts
5. Test thoroughly

### When Removing Features

1. Remove all related files
2. Update imports and exports
3. Clean up dependencies
4. Update documentation
5. Run validation scripts

## Common Patterns

### Action Patterns

```typescript
// Server actions
export async function createResource(data: CreateResourceData) {
	// Implementation
}

// Client actions
export function handleResourceAction(data: ResourceActionData) {
	// Implementation
}
```

### Component Patterns

```typescript
// Component with proper typing
interface ComponentProps {
	data: ComponentData;
	onAction: (data: ActionData) => void;
}

export function Component({ data, onAction }: ComponentProps) {
	// Implementation
}
```

### Hook Patterns

```typescript
// Custom hook with proper typing
export function useFeatureHook(initialData: HookData) {
	// Implementation
	return { data, actions };
}
```

## Troubleshooting

### Common Issues

- Circular dependencies
- Missing barrel exports
- Inconsistent naming
- Improper module boundaries

### Solutions

- Use dependency injection
- Implement proper barrel exports
- Follow naming conventions
- Maintain clear module boundaries

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Project README](../README.md)
