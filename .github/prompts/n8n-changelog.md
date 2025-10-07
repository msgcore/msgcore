# n8n Changelog Generation

Generate a PR description for the **n8n-nodes-msgcore** package based on actual code changes.

## Your Task

1. **Analyze the git diff** to see what actually changed:

   ```bash
   cd $GITHUB_WORKSPACE/n8n-repo
   git diff --staged
   ```

2. **Understand the changes** - Look for:
   - New operations
   - Updated dependencies
   - Node parameter changes
   - Workflow capabilities
   - Breaking changes

3. **Write concise output files**:
   - `/tmp/n8n-pr-title.txt` - One line title (no emojis)
   - `/tmp/n8n-pr-body.md` - Markdown PR description

## Output Guidelines

**Title** (`/tmp/n8n-pr-title.txt`):

- One line, descriptive, no emojis
- Focus on the MAIN change
- Examples: "Update n8n dependencies", "Add webhook operations", "Fix node parameters"

**Body** (`/tmp/n8n-pr-body.md`):

- Start with brief summary
- List only ACTUAL changes from git diff
- Include version info using $VERSION: `**Version**: v$VERSION`
- Link to source backend: `**Source**: [MsgCore Backend](https://github.com/msgcore/msgcore)`
- Keep it concise and direct

## Structure (adapt as needed)

```markdown
## Summary

[1-2 sentence description of what changed]

**Version**: v$VERSION
**Source**: [MsgCore Backend](https://github.com/msgcore/msgcore)

### Changes

[List actual changes - be specific and direct]

- If new operations: list them with brief description
- If dependency updates: list old→new versions
- If breaking changes: explain clearly
- If bug fixes: mention what was fixed

### Workflow Impact (only if new features)

[Describe how new features enable workflows]

### Migration (only if breaking changes)

[Instructions if needed]
```

## Important Rules

✅ **DO**:

- Be flexible - adapt structure to fit actual changes
- Focus on what matters - skip sections if not applicable
- Be direct and concise
- Use actual operation names from git diff
- Include only relevant information
- Mention workflow impact if adding new features

❌ **DON'T**:

- Add sections that don't apply
- Include placeholder text like "X operations generated" if not relevant
- Add generic "improvements" that aren't real
- Use rigid template when simple is better
- Hallucinate operations
- Always mention "300k+ users" (only if relevant context)

## Environment Variables

Available as shell environment variables (access with `$VARIABLE_NAME`):

- `$VERSION` - Package version (e.g., "1.2.1")
- `$COMMIT_SHA` - Commit hash (e.g., "a1b2c3d")
- `$COMMIT_MSG` - Commit message
- `$GITHUB_WORKSPACE` - Workspace directory

**IMPORTANT**: Use these actual values in your output, not placeholder text!
