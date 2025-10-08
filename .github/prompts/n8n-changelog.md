# Generate n8n Package PR Description

You are creating a pull request for the **n8n-nodes-msgcore** package. The repository has been cloned to `n8n-repo/` and all changes are staged in git.

## Task

Analyze what changed in this n8n node update and write a pull request description that will help reviewers understand the changes.

## Steps

1. Navigate to `n8n-repo/` directory
2. Review the staged git changes to understand what's new or different
3. Check `package.json` for the version number
4. Write two output files:
   - `/tmp/n8n-pr-title.txt` - A single-line PR title (no emojis)
   - `/tmp/n8n-pr-body.md` - Full PR description in markdown

## PR Description Requirements

The PR body should include:
- Brief summary of changes (1-2 sentences)
- Version number from package.json
- Source attribution: `**Source**: [MsgCore Backend](https://github.com/msgcore/msgcore)`
- Specific changes found in the diff (new operations, parameter updates, dependency changes)
- Workflow impact explanation if new features enable new automation patterns
- Breaking changes section if applicable
- Migration guide if breaking changes exist

## Quality Guidelines

- Be accurate - only describe changes you see in the git diff
- Be specific - use actual operation names, parameter names, version numbers
- Be concise - focus on what matters to n8n workflow builders
- Adapt the structure to fit the actual changes (skip sections that don't apply)
- Explain workflow impact when relevant (how changes help users build automations)
- No hallucinations - if you don't see it in the diff, don't mention it
