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

### Automated Versioning (Release Please)

The project uses **Release Please** to automate version management.

1. **Automatic Tracking**: Every merge to `main` triggers the bot to update a "Release PR".
2. **Changelog**: The bot maintains `CHANGELOG.md` based on your commit messages.
3. **Releasing**: When you are ready to release, simply merge the "Release PR".
4. **Tagging**: Merging the Release PR automatically creates a Git tag and a GitHub Release.

## Release Process

### 1. Development Workflow

### 1. Development Workflow

1. **Feature Development**: Work on feature branches.
2. **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`) so the bot can categorize changes.
3. **Merge**: Merge feature PRs into `main`.

### 2. Release Steps

1. **Merge Release PR**: Look for the PR titled "chore(main): release x.y.z" opened by the bot.
2. **Verify**: Review the generated changelog in the PR.
3. **Approve & Merge**: Merging this PR triggers the final release and tagging.

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
