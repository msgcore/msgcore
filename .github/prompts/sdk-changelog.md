# Generate SDK Package PR Description

You are creating a pull request for the **@msgcore/sdk** package. The repository has been cloned to `sdk-repo/` and all changes are staged in git.

## Task

Analyze what changed in this SDK update and write a pull request description that will help reviewers understand the changes.

## Steps

1. Navigate to `sdk-repo/` directory
2. Review the staged git changes to understand what's new or different
3. Check `package.json` for the version number
4. Write two output files:
   - `/tmp/sdk-pr-title.txt` - A single-line PR title (no emojis)
   - `/tmp/sdk-pr-body.md` - Full PR description in markdown

## PR Description Requirements

The PR body should include:
- Brief summary of changes (1-2 sentences)
- Version number from package.json
- Source attribution: `**Source**: [MsgCore Backend](https://github.com/msgcore/msgcore)`
- Specific changes found in the diff (new methods, type updates, dependency changes)
- Breaking changes section if applicable
- Migration guide if breaking changes exist

## Quality Guidelines

- Be accurate - only describe changes you see in the git diff
- Be specific - use actual method names, version numbers, file names
- Be concise - focus on what matters to developers using this SDK
- Adapt the structure to fit the actual changes (skip sections that don't apply)
- No hallucinations - if you don't see it in the diff, don't mention it
