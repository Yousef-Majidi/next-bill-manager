# Next Bill Manager

A modern bill management application for property managers and landlords, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Bill Management**: Create and track bills with detailed breakdowns
- **Tenant Management**: Organize tenant information and billing relationships
- **Provider Management**: Manage utility providers and service accounts
- **Dashboard Analytics**: Overview with statistics and insights
- **Email Integration**: Automated email notifications
- **Authentication**: Secure user authentication
- **Responsive Design**: Modern UI for all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Jotai
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Email**: Gmail API
- **Validation**: Zod
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.11.0+
- MongoDB database
- Gmail API credentials (for email features)

### Installation

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
   Create a `.env.local` file:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Gmail API (for email features)
   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
next-bill-manager/
├── src/
│   ├── app/                   # Next.js app router pages
│   ├── components/            # Shared UI components
│   ├── features/              # Feature-based modules
│   │   ├── bills/             # Bill management
│   │   ├── tenants/           # Tenant management
│   │   ├── providers/         # Provider management
│   │   ├── dashboard/         # Dashboard analytics
│   │   ├── auth/              # Authentication
│   │   └── email/             # Email integration
│   ├── lib/                   # Utility libraries
│   ├── hooks/                 # Shared React hooks
│   ├── states/                # Global state management
│   └── types/                 # Global TypeScript types
├── scripts/                   # Build and validation scripts
├── docs/                      # Documentation
└── .github/                   # GitHub Actions workflows
```

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Testing

- `pnpm test` - Run tests
- `pnpm test:run` - Run tests in CI mode
- `pnpm test:coverage` - Generate coverage report

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm validate-all` - Run all validation scripts
- `pnpm quality-gate:full` - Full quality gate with build

### Version Management

- `pnpm release:prepare` - Patch release
- `pnpm release:minor` - Minor release
- `pnpm release:major` - Major release

### Database

- `pnpm db:migrate` - Run database migrations
- `pnpm db:backup` - Backup database
- `pnpm db:restore` - Restore database

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical architecture and code organization
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Development standards
- **[API Documentation](docs/API.md)** - Server actions and API reference
- **[Type Safety Guide](docs/TYPE_SAFETY_GUIDE.md)** - Type safety system
- **[Versioning Strategy](docs/VERSIONING.md)** - Version management

## Development

This project follows a feature-based architecture with clear dependency rules and comprehensive validation.

### Code Organization

- **Feature Isolation**: Each feature is self-contained
- **Barrel Exports**: Clean import/export patterns
- **Type Safety**: Strict TypeScript with runtime validation
- **Validation**: Automated scripts ensure code quality

### Quality Gates

- **Test Coverage**: 70% minimum coverage
- **Quality Gates**: Automated checks for linting, testing, and build
- **CI/CD**: GitHub Actions with automated deployment
- **Version Management**: Automated versioning with semantic versioning

## Contributing

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

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

1. Check the [documentation](docs/)
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
