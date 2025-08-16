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

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Jotai
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Email**: Gmail API integration
- **Validation**: Zod
- **Package Manager**: pnpm

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
├── scripts/                   # Build and validation scripts
└── docs/                      # Documentation
```

## 🧪 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm validate-all` - Run all validation scripts
- `pnpm check-dependencies` - Validate feature dependencies
- `pnpm validate-structure` - Validate feature structure
- `pnpm validate-exports` - Validate barrel exports

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Comprehensive technical architecture and code organization
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Development standards and contribution process
- **[API Documentation](docs/API.md)** - Server actions and API reference

## 🔧 Development

This project follows a feature-based architecture with strict dependency rules and comprehensive validation. See the [Contributing Guidelines](docs/CONTRIBUTING.md) for detailed development standards.

### Code Organization

- **Feature Isolation**: Each feature is self-contained with minimal cross-dependencies
- **Barrel Exports**: Clean import/export patterns using index files
- **Type Safety**: Strict TypeScript configuration with comprehensive type definitions
- **Validation**: Automated scripts ensure code organization compliance

### Validation Scripts

The project includes several validation scripts to maintain code quality:

- **Dependency Checking**: Ensures features follow dependency rules
- **Structure Validation**: Validates feature directory structure
- **Export Validation**: Ensures proper barrel export patterns
- **Code Organization Testing**: Comprehensive code organization validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Contributing Guidelines](docs/CONTRIBUTING.md)
4. Run validation scripts (`pnpm validate-all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](docs/)
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
