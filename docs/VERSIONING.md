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

## Version Management

### Automated Versioning

Use the version manager script for consistent versioning:

```bash
# Patch release (bug fixes)
node scripts/version-manager.mjs patch

# Minor release (new features)
node scripts/version-manager.mjs minor

# Major release (breaking changes)
node scripts/version-manager.mjs major

# Preview release (beta)
node scripts/version-manager.mjs preview
```

### Package Scripts

```bash
# Quick version bump with quality checks
pnpm run release:prepare    # Patch release
pnpm run release:minor      # Minor release
pnpm run release:major      # Major release
```

## Release Process

### 1. Development Workflow

1. **Feature Development**: Work on `develop` branch
2. **Quality Gates**: All changes must pass quality checks
3. **Testing**: Comprehensive testing before release
4. **Version Bump**: Use appropriate version increment

### 2. Release Steps

1. **Quality Check**: Run `pnpm run quality-gate:full`
2. **Version Update**: Use version manager script
3. **Git Tag**: Automatic tag creation
4. **CI/CD**: Automated testing and deployment
5. **Release Notes**: Auto-generated from commit history

### 3. Deployment

- **Preview**: Automatic deployment on PR
- **Production**: Automatic deployment on main branch push
- **Release**: GitHub release created on tag push

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
- ✅ Code quality checks passing
- ✅ Type safety validation
- ✅ Build successful
- ✅ Security audit clean

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

- **Development**: Latest commit on develop branch
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
