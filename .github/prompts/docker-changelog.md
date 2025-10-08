# Generate Docker Release Changelog

You are creating a GitHub release for the **MsgCore Docker image**. Analyze the git history to understand what changed since the last release.

## Task

Review the commits and changes in the MsgCore repository and write release notes that will help users understand what's new in this Docker image version.

## Steps

1. Check `package.json` for the current version number
2. Use git log to identify changes since the last release tag
3. Categorize the changes (features, fixes, breaking changes, dependencies, security)
4. Write two output files:
   - `/tmp/docker-tag-title.txt` - A single-line release title (no emojis, no version)
   - `/tmp/docker-tag-body.md` - Full release notes in markdown

## Release Notes Requirements

The release body should include:
- Brief summary of this release (1-2 sentences)
- Version number from package.json
- Changes grouped by category:
  - ✨ Features (new functionality)
  - 🐛 Fixes (bug fixes and improvements)
  - ⚠️ Breaking Changes (API changes requiring user action)
  - 📦 Dependencies (updated packages)
  - 🔒 Security (security fixes)
- Docker pull command with correct version
- Upgrade instructions if breaking changes exist
- Link to full changelog comparing tags

## Quality Guidelines

- Be accurate - only describe changes found in git history
- Be specific - mention actual features, files, or API endpoints that changed
- Be user-focused - write for people deploying the Docker image, not developers
- Ignore non-git output (no Docker build logs, bash prompts, or other terminal noise)
- Group similar changes together logically
- Skip sections with no relevant changes
- Highlight breaking changes prominently
- No hallucinations - if you don't see it in git history, don't mention it
