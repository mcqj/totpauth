# GitHub Copilot Instructions Setup

This document explains the GitHub Copilot instructions configuration for this repository.

## Overview

This repository is configured with GitHub Copilot instructions following the best practices outlined in [GitHub's official documentation](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results).

## Instruction Files

### 1. `.github/copilot-instructions.md` (Primary)

**Purpose**: Repository-wide instructions for GitHub Copilot coding agents

**Contents**:
- Project overview and technology stack
- Bootstrap and build process
- Development workflow and testing guidelines
- Project structure and important files
- Development guidelines (React/TypeScript conventions)
- Styling guidelines (nativewind)
- Validation scenarios
- Common issues and solutions
- Documentation references

**When it's used**: GitHub Copilot reads this file automatically when working on any part of the repository.

### 2. `AGENTS.md` (Root Level)

**Purpose**: Quick reference for agents starting work on the repository

**Contents**:
- Quick start guide
- Repository context
- Key principles (minimal changes, test first, etc.)
- Build & test commands
- Technology-specific notes
- Common pitfalls
- Validation checklist

**When it's used**: Agents can reference this for quick guidance, especially when using GitHub Copilot coding agent features in VS Code or other editors.

### 3. `expoapp/AGENTS.md` (Subdirectory)

**Purpose**: Context-specific instructions for the main application directory

**Contents**:
- Quick commands (already in correct directory context)
- Project structure within expoapp
- TypeScript path aliases usage
- Styling examples with nativewind
- Testing patterns and examples
- React 19 conventions with code examples
- Common issues specific to this directory

**When it's used**: Provides directory-specific context when agents are working within the `/expoapp` directory.

## Best Practices Implemented

✅ **Repository-wide instructions**: `.github/copilot-instructions.md` provides comprehensive guidance
✅ **Agent-specific files**: `AGENTS.md` files offer quick reference for coding agents
✅ **Clear structure**: Well-organized sections with practical examples
✅ **Actionable guidance**: Specific commands with expected timing
✅ **Technology conventions**: Explicit rules for React, TypeScript, and styling
✅ **Validation steps**: Clear checklist for verifying changes
✅ **Documentation references**: Links to related documentation

## How Copilot Uses These Files

1. **Automatic Context**: When you use GitHub Copilot in this repository, it automatically reads `.github/copilot-instructions.md` to understand project conventions and guidelines.

2. **Coding Agent**: When using GitHub Copilot's coding agent feature, the agent references these instructions to:
   - Understand how to build and test the project
   - Follow the correct coding conventions
   - Use the right tools and libraries
   - Avoid common pitfalls

3. **Contextual Guidance**: The `AGENTS.md` files provide quick reference and examples that agents can use when making decisions.

## Updating Instructions

When updating these files:

1. **Keep them concise**: Focus on what cannot be inferred from code
2. **Be specific**: Include exact commands, file paths, and conventions
3. **Provide examples**: Show the right way and wrong way to do things
4. **Update regularly**: Keep instructions current as the project evolves
5. **Avoid contradictions**: Ensure all instruction files are aligned

## Related Documentation

- `.github/copilot-instructions.md` - Comprehensive project guidelines
- `docs/totp-authenticator-prd.md` - Product requirements
- `docs/totp-authenticator-techspec.md` - Technical specification
- `README.md` - User-facing documentation

## References

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Custom Instructions Guide](https://dev.to/arjun_c_615745c0e95e8f459/working-with-github-copilot-custom-instructions-agents-n4f)
- [AGENTS.md Support](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/)
