# Generate CLI Package PR Description

You are creating a pull request for the **@msgcore/cli** package. The repository has been cloned to `cli-repo/` and all changes are staged in git.

## Task

Analyze what changed in this CLI update and write a pull request description that will help reviewers understand the changes.

## Steps

1. Navigate to `cli-repo/` directory
2. Review the staged git changes to understand what's new or different
3. Check `package.json` for the version number
4. Write two output files:
   - `/tmp/cli-pr-title.txt` - A single-line PR title (no emojis)
   - `/tmp/cli-pr-body.md` - Full PR description in markdown

## PR Description Requirements

The PR body should include:
- Brief summary of changes (1-2 sentences)
- Version number from package.json
- Source attribution: `**Source**: [MsgCore Backend](https://github.com/msgcore/msgcore)`
- Specific changes found in the diff (new commands, flag updates, dependency changes)
- Usage examples for new commands if applicable
- Breaking changes section if applicable
- Migration guide if breaking changes exist

## Quality Guidelines

- Be accurate - only describe changes you see in the git diff
- Be specific - use actual command names, flag names, version numbers
- Be concise - focus on what matters to CLI users
- Adapt the structure to fit the actual changes (skip sections that don't apply)
- Show real command examples if new features were added
- No hallucinations - if you don't see it in the diff, don't mention it
