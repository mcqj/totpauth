# Agent Instructions for TOTP Authenticator App

This file provides agent-specific instructions for GitHub Copilot coding agents working on this repository.

## Quick Start for Agents

Before starting any work:
1. **ALWAYS** reference `.github/copilot-instructions.md` first for comprehensive project guidelines
2. Navigate to `/home/runner/work/totpauth/totpauth/expoapp` for all development work
3. Verify dependencies are installed: `npm install` (takes ~45 seconds)

## Repository Context

This is a React Native Expo app for TOTP (Time-based One-Time Password) generation. The app is TypeScript-based, uses expo-router for navigation, and nativewind for styling.

## Key Principles

1. **Minimal Changes**: Make the smallest possible changes to achieve the goal
2. **Test First**: Always run existing tests before making changes (`npm run test:ci`)
3. **Lint Always**: Run `npm run lint` before committing
4. **Work Directory**: All npm commands must be run from `/home/runner/work/totpauth/totpauth/expoapp`

## Build & Test Commands

```bash
# Navigate to app directory
cd /home/runner/work/totpauth/totpauth/expoapp

# Install dependencies (first time only, ~45 seconds)
npm install

# Run tests (takes ~11 seconds, NEVER CANCEL)
npm run test:ci

# Run linting (takes ~3 seconds)
npm run lint

# Start development server
npx expo start
```

## Technology-Specific Notes

- **React**: Use React 19 conventions (no React imports in components)
- **TypeScript**: Always use TypeScript, avoid `any` types
- **Styling**: Use nativewind utility classes, NEVER use StyleSheet.create
- **Navigation**: expo-router file-based routing in `/app` directory
- **Storage**: Expo SecureStore for credential storage
- **Testing**: Jest + React Native Testing Library

## Common Pitfalls to Avoid

1. ❌ Don't work from repository root - always `cd expoapp` first
2. ❌ Don't cancel npm install or test runs - they complete quickly
3. ❌ Don't use StyleSheet.create - use nativewind classes instead
4. ❌ Don't import React in component files (React 19)
5. ❌ Don't add new dependencies without checking for Expo compatibility

## Validation Checklist

Before completing any task:
- [ ] All tests pass (`npm run test:ci`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows nativewind styling conventions
- [ ] TypeScript types are correct
- [ ] Changes are minimal and surgical

## Documentation

For detailed information, always refer to:
- **Primary**: `.github/copilot-instructions.md` - Comprehensive project guidelines
- **PRD**: `docs/totp-authenticator-prd.md` - Product requirements
- **Tech Spec**: `docs/totp-authenticator-techspec.md` - Technical specification

## Need Help?

If you encounter issues:
1. Check `.github/copilot-instructions.md` for detailed guidance
2. Review existing code patterns in the codebase
3. Check the docs/ directory for specifications
4. Ask the user for clarification if requirements are unclear
