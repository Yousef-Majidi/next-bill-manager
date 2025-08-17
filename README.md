# Next Bill Manager

A modern, feature-rich bill management application built with Next.js 15, TypeScript, and Tailwind CSS. This application helps property managers and landlords efficiently manage billing, tenant information, and utility providers.

## 🚀 Features

- **Bill Management**: Create, track, and manage bills with detailed breakdowns
- **Tenant Management**: Organize tenant information and billing relationships
- **Provider Management**: Manage utility providers and service accounts
- **Dashboard Analytics**: Comprehensive overview with statistics and insights
- **Email Integration**: Automated email notifications and bill distribution
- **Authentication**: Secure user authentication with NextAuth.js
- **Responsive Design**: Modern UI that works on all devices
- **Type Safety**: Comprehensive TypeScript configuration with runtime validation
- **Performance Optimized**: Caching, lazy evaluation, and performance monitoring

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict configuration)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Jotai
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Email**: Gmail API integration
- **Validation**: Zod with runtime type checking
- **Package Manager**: pnpm

## 🔒 Type Safety & Validation

This application implements a comprehensive type safety system:

- **Strict TypeScript Configuration**: Zero compilation errors with strict mode
- **Runtime Validation**: Zod schemas ensure data integrity at runtime
- **Type-Safe Utilities**: Safe operations for arrays, objects, and common patterns
- **Performance Optimizations**: Caching and lazy evaluation for better performance
- **Structured Error Handling**: Discriminated unions for error types
- **Form Integration**: Seamless integration with React Hook Form
- **Database Safety**: Type-safe database operations with schema validation

See the [Type Safety Guide](docs/TYPE_SAFETY_GUIDE.md) for detailed information and examples.

## 📋 Prerequisites

- Node.js 18+
- pnpm 10.11.0+
- MongoDB database
- Gmail API credentials (for email features)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd next-bill-manager
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Gmail API (for email features)
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
next-bill-manager/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Shared UI components
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   ├── settings/          # Settings page components
│   │   └── ...                # Other component categories
│   ├── features/               # Feature-based modules
│   │   ├── bills/             # Bill management feature
│   │   ├── tenants/           # Tenant management feature
│   │   ├── providers/         # Provider management feature
│   │   ├── dashboard/         # Dashboard analytics feature
│   │   ├── auth/              # Authentication feature
│   │   └── email/             # Email integration feature
│   ├── lib/                   # Utility libraries and configurations
│   ├── hooks/                 # Shared React hooks
│   ├── states/                # Global state management
│   └── types/                 # Global TypeScript types
├── scripts/                   # Build, validation, and versioning scripts
├── docs/                      # Documentation
├── .github/                   # GitHub Actions workflows
└── .husky/                    # Git hooks
```

## 🧪 Available Scripts

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server

### Testing & Quality

- `pnpm test` - Run tests with Vitest
- `pnpm test:run` - Run tests in CI mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:coverage:html` - Generate HTML coverage report
- `pnpm test:coverage:lcov` - Generate LCOV coverage report

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm validate-all` - Run all validation scripts
- `pnpm quality-check` - Run linting, tests, and validation
- `pnpm quality-gate` - Run quality gate checks
- `pnpm quality-gate:full` - Full quality gate with build

### Validation Scripts

- `pnpm check-dependencies` - Validate feature dependencies
- `pnpm validate-structure` - Validate feature structure
- `pnpm validate-exports` - Validate barrel exports

### Version Management

- `pnpm release:prepare` - Quality-checked patch release
- `pnpm release:minor` - Quality-checked minor release
- `pnpm release:major` - Quality-checked major release
- `node scripts/version-manager.mjs` - Manual version management

### Database

- `pnpm db:migrate` - Run database migrations
- `pnpm db:backup` - Backup database collections
- `pnpm db:restore` - Restore database collections
- `pnpm db:diagnose` - Diagnose database issues

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Comprehensive technical architecture and code organization
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Development standards and contribution process
- **[API Documentation](docs/API.md)** - Server actions and API reference
- **[Type Safety Guide](docs/TYPE_SAFETY_GUIDE.md)** - Comprehensive type safety system and validation
- **[Type Safety Examples](docs/TYPE_SAFETY_EXAMPLES.md)** - Practical examples of type safety implementation
- **[Versioning Strategy](docs/VERSIONING.md)** - Version management and release process

## 🔧 Development

This project follows a feature-based architecture with strict dependency rules and comprehensive validation. See the [Contributing Guidelines](docs/CONTRIBUTING.md) for detailed development standards.

### Code Organization

- **Feature Isolation**: Each feature is self-contained with minimal cross-dependencies
- **Barrel Exports**: Clean import/export patterns using index files
- **Type Safety**: Strict TypeScript configuration with comprehensive type definitions and runtime validation
- **Validation**: Automated scripts ensure code organization compliance and type safety

### Type Safety System

The application implements a comprehensive type safety system:

- **Strict TypeScript Configuration**: Zero compilation errors with strict mode enabled
- **Runtime Validation**: Zod schemas ensure data integrity at runtime
- **Type-Safe Utilities**: Safe operations for arrays, objects, and common patterns
- **Performance Optimizations**: Caching and lazy evaluation for better performance
- **Structured Error Handling**: Discriminated unions for error types
- **Form Integration**: Seamless integration with React Hook Form
- **Database Safety**: Type-safe database operations with schema validation

### Quality Gates & Testing

The project implements comprehensive quality gates and testing infrastructure:

- **Test Coverage**: 70% minimum coverage with Vitest and V8 coverage provider
- **Quality Gates**: Automated checks for linting, testing, validation, and build
- **CI/CD Integration**: GitHub Actions with automated testing and deployment
- **Version Management**: Automated versioning with semantic versioning
- **Release Process**: Quality-checked releases with automated changelog generation

### Validation Scripts

The project includes several validation scripts to maintain code quality:

- **Dependency Checking**: Ensures features follow dependency rules
- **Structure Validation**: Validates feature directory structure
- **Export Validation**: Ensures proper barrel export patterns
- **Code Organization Testing**: Comprehensive code organization validation
- **Type Safety Validation**: Ensures strict TypeScript compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Contributing Guidelines](docs/CONTRIBUTING.md)
4. Run quality gates (`pnpm run quality-gate:full`)
5. Ensure tests pass (`pnpm run test:run`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Quality Requirements

- All tests must pass with 70% minimum coverage
- Code must pass linting and validation checks
- Build must complete successfully
- Follow semantic versioning for releases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](docs/)
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
