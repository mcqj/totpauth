# TOTP Authenticator App - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview

This is a secure React Native Expo app for generating Time-based One-Time Passwords (TOTP) for two-factor authentication (2FA). The app allows users to add, manage, and use multiple TOTP credentials by scanning QR codes or manual entry.

## Working Effectively

### Bootstrap and Build Process
- **ALWAYS** work from the `/expoapp` directory for all npm commands and development tasks
- Navigate to expoapp directory: `cd /home/runner/work/totpauth/totpauth/expoapp`
- Install dependencies: `npm install` -- takes ~45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Install Expo CLI globally if needed: `npm install -g @expo/cli@latest` -- takes ~15 seconds
- Check Expo CLI version: `npx expo --version`

### Development Workflow
- Start development server: `npx expo start` 
- Start for web only: `npx expo start --web`
- Start for specific platform: `npx expo start --android` or `npx expo start --ios`
- **Note**: Development server may not work in CI environments. Focus on build validation and testing instead.

### Testing and Quality Assurance
- Run all tests: `npm run test:ci` -- takes ~11 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Run tests in watch mode: `npm test`
- Run linting: `npm run lint` -- takes ~3 seconds. Currently shows 5 warnings in ManualEntry.tsx (unused 'e' parameters).
- **ALWAYS** run linting before committing changes
- **ALWAYS** run the full test suite before completing work

### Build and Package Management
- Use `npx expo install <package>` for Expo-compatible packages
- Use `npm install <package>` for standard npm packages
- Check for package updates: `npx expo install --check`
- Fix package version conflicts: `npx expo install --fix`

## Project Structure

### Key Directories
- `/expoapp` -- Main application code (ALWAYS work from this directory)
- `/expoapp/app` -- Screens and routes (expo-router file-based routing)
- `/expoapp/components` -- Reusable UI components
- `/expoapp/utils` -- Utility functions (TOTP generation, QR parsing, storage)
- `/expoapp/contexts` -- React contexts (CredentialsContext, ToastContext)
- `/expoapp/assets` -- Images, icons, fonts
- `/expoapp/__tests__` -- Component and integration tests
- `/expoapp/tests/utils` -- Test utilities and helpers
- `/docs` -- Product requirements and technical specifications

### Important Files
- `/expoapp/package.json` -- Dependencies and scripts
- `/expoapp/app.json` -- Expo configuration
- `/expoapp/tsconfig.json` -- TypeScript configuration with path aliases
- `/expoapp/eslint.config.js` -- ESLint configuration
- `/expoapp/jest.config.js` -- Jest test configuration
- `/expoapp/nativewind.config.js` -- NativeWind/TailwindCSS configuration

## Technology Stack

- **Framework**: React Native with Expo-managed workflow (v53.x)
- **Language**: TypeScript
- **Navigation**: expo-router (file-based routing)
- **Styling**: nativewind (TailwindCSS utility classes) - DO NOT use StyleSheet.create
- **TOTP Generation**: Custom RFC 6238-compliant implementation using crypto-js
- **Storage**: Expo SecureStore for credential storage
- **Camera**: Expo Camera (replaces deprecated expo-barcode-scanner)
- **Testing**: Jest + React Native Testing Library
- **State Management**: React Context (CredentialsContext, ToastContext)

## Development Guidelines

### React/TypeScript Conventions
- Use React 19 conventions: **DO NOT** import React in component files
- **DO NOT** use `React.FC` - use regular function declarations
- Prefer functional components with hooks (useState, useEffect, etc.)
- Use TypeScript for all new files
- Follow existing prop types and interfaces
- All import statements should be at the beginning of files before any code
- Use `import { Component } from 'react';` instead of `import React, { Component } from 'react';`
- Always prefer esModules to commonJS and never mix esModule and CommonJS syntax in the same file

### Styling Guidelines
- **ALWAYS** use nativewind utility classes for styling
- **NEVER** use StyleSheet.create or styled-components
- Follow mobile-first responsive design
- Support both light and dark mode

### File Structure Guidelines
- Place test files alongside components with `.test.tsx` or `.test.ts` extensions
- Use path aliases: `@components/*`, `@utils/*`, `@hooks/*`, `@constants/*`
- Follow expo-router conventions for screens in `/app` directory
- Place components in the `components/` directory
- Place utility functions in the `utils/` directory
- Place assets (images, fonts, etc.) in the `assets/` directory

### Example Component Skeleton

```tsx
type Props = {
  title: string;
};

export default function ExampleComponent({ title }: Props) {
  return (
    <View className="p-4 bg-white rounded">
      <Text className="text-lg font-bold">{title}</Text>
    </View>
  );
}
```

## Validation Scenarios

**ALWAYS** perform these validation steps after making changes:

### Core Functionality Testing
1. **App Launch**: Verify app starts without crashes
2. **Credential List**: Navigate to main screen, verify existing credentials display
3. **Add Credential via QR**: Test QR code scanning flow (if camera available)
4. **Add Credential Manually**: Test manual entry form with valid TOTP URI
5. **TOTP Generation**: Verify codes generate and update every 30 seconds
6. **Credential Deletion**: Test removing credentials from the list
7. **Dark/Light Mode**: Toggle between modes and verify UI consistency

### Testing Workflow
- Use manual entry for testing in simulators: `otpauth://totp/TestApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TestApp`
- Test with different TOTP parameters (6-digit vs 8-digit codes, different periods)
- Verify secure storage works by restarting app and checking credentials persist

## Common Issues and Solutions

### Known Warnings
- 5 ESLint warnings in `ManualEntry.tsx` for unused 'e' parameters - these are acceptable
- Expo may show networking warnings in CI environments - this is expected

### Package Management
- Use `npx expo install` instead of `npm install` for Expo SDK packages
- If package conflicts occur, run `npx expo install --fix`
- expo-barcode-scanner is deprecated - use expo-camera instead

### Directory Navigation
- **CRITICAL**: Always ensure you're in `/home/runner/work/totpauth/totpauth/expoapp` before running npm commands
- Commands like `npm install`, `npm test`, `npm run lint` must be run from the expoapp directory

### Storage and Keys
- SecureStore keys must not contain spaces or special characters
- Use proper encoding for credential names when storing in SecureStore
- Test storage by restarting the app to verify persistence

## Testing Guidelines

### Test Structure
- Component tests in `__tests__/` directory
- Test utilities in `tests/utils/test-utils.tsx`
- Use `renderWithProviders()` helper for components that need context providers
- Mock contexts are configured in `jest.setup.js`

### Test Commands
```bash
npm run test:ci        # Run all tests once (CI mode)
npm test              # Run tests in watch mode
npm run lint          # Run ESLint
```

## Build Process Notes

- **NEVER CANCEL** builds or test runs - they complete quickly in this project
- npm install: ~45 seconds
- Test suite: ~11 seconds  
- Linting: ~3 seconds
- Expo CLI commands are generally fast (1-5 seconds)

## Common Commands Reference

```bash
# Setup (run once)
cd /home/runner/work/totpauth/totpauth/expoapp
npm install
npm install -g @expo/cli@latest

# Development workflow
npm run lint                    # Check code style
npm run test:ci                # Run all tests
npx expo start --web           # Start dev server (web)
npx expo install <package>     # Install Expo-compatible package

# Package management
npx expo install --check       # Check for package updates
npx expo install --fix         # Fix package version conflicts
```

## Documentation References

- [Expo Documentation](https://docs.expo.dev/)
- [expo-router](https://expo.github.io/router/docs)
- [nativewind](https://www.nativewind.dev/)
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Project PRD](../docs/totp-authenticator-prd.md)
- [Technical Specification](../docs/totp-authenticator-techspec.md)