# Versioning Strategy

This document outlines the versioning strategy for the Next Bill Manager project.

## Overview

We follow [Semantic Versioning (SemVer)](https://semver.org/) with the format `MAJOR.MINOR.PATCH`.

## Version Components

- **MAJOR** (0): Breaking changes, API incompatibilities
- **MINOR** (1): New features, backward compatible
- **PATCH** (0): Bug fixes, backward compatible

## Current Version

- **Version**: `0.1.0`
- **Status**: Development/Alpha
- **Stability**: Breaking changes expected

### Version Management

Use standard `npm version` commands:

```bash
# Patch version bump (0.1.0 -> 0.1.1)
pnpm version patch

# Minor version bump (0.1.0 -> 0.2.0)
pnpm version minor

# Major version bump (0.1.0 -> 1.0.0)
pnpm version major
```

## Release Process

### 1. Development Workflow

### 1. Development Workflow

1. **Feature Development**: Work on feature branches and merge to `main`
2. **Quality Checks**: Ensure linting and tests pass
3. **Version Bump**: Increment version before release

### 2. Release Steps

1. **Local Check**: Run `pnpm test` and `pnpm lint`
2. **Version Update**: `pnpm version [patch|minor|major]`
3. **Push Changes**: `git push origin main --tags`
4. **CI/CD**: GitHub Actions handles verification and deployment

## Version History

| Version | Date    | Type    | Description                         |
| ------- | ------- | ------- | ----------------------------------- |
| 0.1.0   | Current | Initial | Base application with core features |

## Breaking Changes Policy

During development (v0.x.x):

- Breaking changes may occur in minor versions
- Document all breaking changes in release notes
- Provide migration guides when possible

After v1.0.0:

- Breaking changes only in major versions
- Deprecation warnings before breaking changes
- Extended support for previous major versions

## Quality Gates

Before any release:

- ✅ All tests passing
- ✅ Linting checks passing
- ✅ Build successful
- ✅ Type safety validation

## Commit Message Convention

Follow conventional commits for automatic changelog generation:

- `feat:` New features (minor version)
- `fix:` Bug fixes (patch version)
- `BREAKING CHANGE:` Breaking changes (major version)
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

## Environment-Specific Versions

- **Development**: Latest commit on `main` branch
- **Staging**: Latest tag with `-beta` suffix
- **Production**: Latest stable tag

## Rollback Strategy

- **Quick Rollback**: Revert to previous tag
- **Database Migration**: Version-specific migration scripts
- **Feature Flags**: Gradual feature rollout
- **Monitoring**: Health checks and alerting

## Future Considerations

- **Monorepo Support**: If splitting into multiple packages
- **API Versioning**: REST API versioning strategy
- **Database Schema**: Migration versioning
- **Dependency Updates**: Automated dependency management
