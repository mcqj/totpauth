# Agent Instructions - Expo App Directory

You are currently in the main application directory (`/expoapp`). All npm commands and development work should be done from this directory.

## Quick Commands

```bash
# You're already in the right directory
pwd  # Should show: /home/runner/work/totpauth/totpauth/expoapp

# Install dependencies (first time or after package.json changes)
npm install

# Run tests
npm run test:ci        # CI mode (single run)
npm test              # Watch mode

# Run linting
npm run lint

# Start development
npx expo start
npx expo start --web   # Web only
```

## Project Structure

- `app/` - Screens and routes (expo-router file-based routing)
- `components/` - Reusable UI components
- `utils/` - Utility functions (TOTP, storage, QR parsing)
- `contexts/` - React contexts (CredentialsContext, ToastContext)
- `__tests__/` - Component tests
- `tests/utils/` - Test utilities and helpers

## TypeScript Path Aliases

Use these imports in your code:
- `@components/*` - Components
- `@utils/*` - Utilities
- `@hooks/*` - Custom hooks
- `@constants/*` - Constants

Example:
```typescript
import { CredentialCard } from '@components/CredentialCard';
import { generateTOTP } from '@utils/totp';
```

## Styling with nativewind

Always use nativewind utility classes:

```tsx
// ✅ Good
<View className="p-4 bg-white dark:bg-gray-800 rounded-lg">
  <Text className="text-lg font-bold text-gray-900 dark:text-white">
    Title
  </Text>
</View>

// ❌ Bad - Don't use StyleSheet
const styles = StyleSheet.create({
  container: { padding: 16 }
});
```

## Testing

- Place test files alongside components: `ComponentName.test.tsx`
- Use `renderWithProviders()` from `tests/utils/test-utils.tsx` for components that need context
- Mock contexts are configured in `jest.setup.js`

Example test:
```typescript
import { renderWithProviders } from '../tests/utils/test-utils';
import { screen } from '@testing-library/react-native';

test('renders component', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('Hello')).toBeTruthy();
});
```

## React 19 Conventions

```tsx
// ✅ Good - No React import needed
import { useState } from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
};

export default function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);
  return <View><Text>{title}</Text></View>;
}

// ❌ Bad - Don't import React or use React.FC
import React from 'react';
const MyComponent: React.FC<Props> = ({ title }) => { ... };
```

## Common Issues

1. **Tests not found**: Make sure you're in `/expoapp` directory
2. **Module not found**: Run `npm install` to install dependencies
3. **Path alias errors**: Check `tsconfig.json` for correct path configurations
4. **Expo CLI not found**: Install globally: `npm install -g @expo/cli@latest`

## Documentation

For complete guidelines, see:
- `../.github/copilot-instructions.md` - Full project guidelines
- `../docs/totp-authenticator-prd.md` - Product requirements
- `../docs/totp-authenticator-techspec.md` - Technical specification
