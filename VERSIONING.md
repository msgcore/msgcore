# MsgCore Versioning Strategy

## Coordinated Versioning System

All MsgCore packages (backend, SDK, CLI, n8n) use **synchronized versions** from the backend `package.json`.

**Architecture:**

- 📦 Backend version → Single source of truth
- 🔄 All generators import backend `package.json` version
- ✅ CLI automatically references matching SDK version (`^x.y.z`)
- 🎯 Version represents MsgCore API contract version
- 📁 All packages live in `packages/` directory (monorepo with npm workspaces)

## Version Bump Process

### 1. Bump Backend Version

Use npm's built-in version commands:

```bash
# Patch release (bug fixes): 1.2.1 → 1.2.2
npm version patch

# Minor release (new features): 1.2.1 → 1.3.0
npm version minor

# Major release (breaking changes): 1.2.1 → 2.0.0
npm version major
```

**What happens:**

- ✅ Backend `package.json` version updated
- ✅ Git commit created automatically with new version tag
- ⚠️ **Note:** Packages are NOT auto-regenerated. Run `npm run generate:all` separately

### 2. Regenerate Packages

```bash
npm run generate:all
```

### 3. Verify Coordinated Versions

Check all packages have the same version:

```bash
npm run version:check
```

**Expected Output:**

```
Backend: 1.2.2
SDK: 1.2.2
CLI: 1.2.2
n8n: 1.2.2
```

### 4. Commit and Push

```bash
git add .
git commit -m "chore: regenerate packages for v1.2.2"
git push origin main --tags
```

### 5. Publish Packages

Publish each package individually as needed:

```bash
# Publish SDK first (CLI depends on it)
npm run publish:sdk

# Then publish CLI
npm run publish:cli

# n8n is independent
npm run publish:n8n
```

**Important:** Always publish SDK before CLI if both have changes, since CLI depends on SDK.

## Semantic Versioning Rules

### Patch (1.2.1 → 1.2.2)

**When to use:**

- Bug fixes
- Performance improvements
- Documentation updates
- No API changes

**Examples:**

```bash
# Fixed Discord message delivery bug
npm version patch
```

### Minor (1.2.1 → 1.3.0)

**When to use:**

- New features (backward compatible)
- New platform support
- New API endpoints
- Enhanced functionality

**Examples:**

```bash
# Added WhatsApp platform support
npm version minor
```

### Major (1.2.1 → 2.0.0)

**When to use:**

- Breaking API changes
- Removed endpoints
- Changed request/response formats
- Architecture changes

**Examples:**

```bash
# Redesigned message queue system
npm version major
```

## Version Workflow Best Practices

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feat/new-platform

# 2. Implement feature
git commit -m "feat: add Slack platform support"

# 3. Merge to main
git checkout main
git merge feat/new-platform

# 4. Bump version (minor for new feature)
npm version minor

# 5. Regenerate packages
npm run generate:all

# 6. Commit and push
git add .
git commit -m "chore: regenerate packages"
git push origin main --tags

# 7. Publish packages
npm run publish:sdk
npm run publish:cli
```

### Pre-Release Versions

For beta/alpha releases:

```bash
# Create pre-release version
npm version 1.3.0-beta.1 --no-git-tag-version
npm run generate:all

# Commit manually
git add .
git commit -m "chore: prepare v1.3.0-beta.1"
git tag v1.3.0-beta.1
git push origin main --tags
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch from tag
git checkout -b hotfix/critical-bug v1.2.1

# 2. Fix bug
git commit -m "fix: resolve critical message delivery bug"

# 3. Bump patch version
npm version patch

# 4. Regenerate and push
npm run generate:all
git add .
git commit -m "chore: regenerate packages"
git push origin hotfix/critical-bug --tags
```

## Version Verification

### Check Current Versions

```bash
# Backend version
node -p "require('./package.json').version"

# All package versions
npm run version:check
```

### Verify Version Sync

```bash
# Ensure all packages match backend
npm run generate:all
npm run version:check
```

## Troubleshooting

### Version Mismatch Detected

**Problem:** Generated packages have different versions than backend.

**Solution:**

```bash
# Regenerate all packages
npm run generate:all

# Verify versions match
npm run version:check
```

### Accidental Version Bump

**Problem:** Bumped version by mistake.

**Solution:**

```bash
# Undo last commit (version bump)
git reset --hard HEAD~1

# Restore correct version
npm version 1.2.1 --no-git-tag-version
npm run generate:all
```

### Need to Skip Generation

**Problem:** Want to bump version without regenerating packages.

**Solution:**

```bash
# Manual version bump
npm version patch --no-git-tag-version

# Regenerate later
npm run generate:all
```

## Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] All contracts validated (`npm run validate:contracts:types`)
- [ ] Version bumped appropriately (patch/minor/major)
- [ ] All packages regenerated (`npm run generate:all`)
- [ ] Versions verified (`npm run version:check`)
- [ ] Committed and pushed with tags
- [ ] SDK published (`npm run publish:sdk`)
- [ ] CLI published (`npm run publish:cli`)
- [ ] n8n published (`npm run publish:n8n`) - if needed

## Package Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run generate:all` | Extract contracts and regenerate all packages |
| `npm run version:check` | Verify all package versions match |
| `npm run build:sdk` | Build SDK package |
| `npm run build:cli` | Build CLI package |
| `npm run build:n8n` | Build n8n package |
| `npm run publish:sdk` | Build and publish SDK to npm |
| `npm run publish:cli` | Build and publish CLI to npm |
| `npm run publish:n8n` | Build and publish n8n to npm |

## Links

- [CLAUDE.md](./CLAUDE.md) - Complete technical architecture and contract system
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and release process
