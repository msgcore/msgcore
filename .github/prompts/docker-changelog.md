# Docker Release Changelog Generation

Generate a release changelog for the **MsgCore Docker image** based on git changes since the last release.

## Your Task

1. **Analyze git changes** since the last tag:

   ```bash
   cd $GITHUB_WORKSPACE

   if [ "$LAST_TAG" = "initial" ]; then
     echo "Initial release - analyzing all commits"
     git log --oneline --no-merges
   else
     echo "Analyzing changes since $LAST_TAG"
     git log --oneline --no-merges "$LAST_TAG..HEAD"
     git diff --stat "$LAST_TAG..HEAD"
   fi
   ```

2. **Categorize changes** - Look for:
   - **Features**: New functionality, endpoints, platforms
   - **Fixes**: Bug fixes, improvements
   - **Breaking Changes**: API changes, removed features
   - **Dependencies**: Updated packages
   - **Performance**: Optimizations
   - **Security**: Security fixes
   - **Documentation**: Docs updates

3. **Write concise output files**:
   - `/tmp/docker-tag-title.txt` - One line title (no emojis, no version number)
   - `/tmp/docker-tag-body.md` - Markdown release notes

## Output Guidelines

**Title** (`/tmp/docker-tag-title.txt`):

- One line, descriptive, no emojis, no version
- Focus on the MAIN theme of this release
- Examples: "Add webhook support and fix message delivery", "Platform improvements and bug fixes", "Initial release"

**Body** (`/tmp/docker-tag-body.md`):

- Start with brief summary
- Group changes by category (Features, Fixes, etc.)
- Use bullet points for each change
- Include breaking changes section if any
- Add upgrade instructions if needed
- Keep it concise and user-focused

## Structure

````markdown
## Summary

[1-2 sentence description of this release]

**Version**: v$VERSION

## Changes

### ✨ Features

- New feature description
- Another feature

### 🐛 Fixes

- Fix description
- Another fix

### ⚠️ Breaking Changes

- Breaking change description with migration guide

### 📦 Dependencies

- Updated dependency X to vY.Z

### 🔒 Security

- Security fix description

## Docker Image

```bash
docker pull msgcore/msgcore:$VERSION
# or
docker pull msgcore/msgcore:latest
```
````

## Upgrade Instructions

[If there are breaking changes or migration steps needed]

---

**Full Changelog**: https://github.com/msgcore/msgcore/compare/LAST_TAG...v$VERSION

````

## Important Notes

- **Be truthful**: Only include changes that actually happened (based on git log/diff)
- **Group logically**: Similar changes should be grouped together
- **User perspective**: Write for users deploying the image, not developers
- **Breaking changes**: Always highlight these prominently
- **No fluff**: Skip sections with no changes

## Example Analysis Commands

```bash
# View commit messages
git log --oneline --no-merges "$LAST_TAG..HEAD"

# See file changes
git diff --name-status "$LAST_TAG..HEAD"

# See detailed changes in specific areas
git log --no-merges --grep="feat\|fix\|breaking" "$LAST_TAG..HEAD"
````

Now analyze the changes and generate the changelog files.
