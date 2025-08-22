# Tests and helpers

This folder contains test helpers used by the unit and integration tests.

Usage
- `renderWithProviders(ui)` - render a React element wrapped in `CredentialsProvider` and `ToastProvider`.

Example:

```ts
import { renderWithProviders } from '../tests/utils';

test('example', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('...')).toBeTruthy();
});
```

Notes and patterns
- Keep helpers outside `__tests__` so Jest does not treat them as test files.
- Use barrels (`tests/utils/index.ts`) to simplify imports across multiple tests.
- Mock `useCredentials` or other hooks in integration tests to avoid touching SecureStore or native APIs.
