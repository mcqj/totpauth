# Copilot Instructions for React Native Expo Project

## General Guidelines
- Use [React Native](https://reactnative.dev/docs/environment-setup) and [Expo](https://expo.dev/) best practices.
- Use React 19 conventions: **do not import React** in component files, and **do not use `React.FC`**.
- Prefer functional components and React Hooks (`useState`, `useEffect`, etc.).
- Use TypeScript for new files and components.
- Follow the project’s folder structure and naming conventions.
- Use Expo APIs for device features (camera, notifications, etc.) when possible.
- For navigation, use [`expo-router`](https://expo.github.io/router/docs) and follow its conventions for file-based routing.
- For styling, use [`nativewind`](https://www.nativewind.dev/) utility classes. Do not use `StyleSheet.create` or styled-components.
- Write concise, well-documented code with clear prop types and interfaces.
- Use async/await for asynchronous code and handle errors gracefully.
- Prefer using Expo-managed workflow unless otherwise specified.

## File and Component Structure
- Place all source code in the `src/` directory.
- Place components in the `components/` directory.
- Place screens and routes according to [`expo-router`](https://expo.github.io/router/docs) conventions (e.g., in the `app/` directory).
- Place utility functions in the `utils/` directory.
- Place assets (images, fonts, etc.) in the `assets/` directory.

## Testing
- Use [Jest](https://jestjs.io/) and [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/) for tests.
- Place test files alongside the components with `.test.tsx` or `.test.ts` extensions.

## Documentation
- Add JSDoc comments for complex functions and components.
- Update the README.md with any new setup or usage instructions.

## Expo Specific
- Use `expo install` for installing dependencies to ensure compatibility.
- Use Expo’s CLI commands (`expo start`, `expo build`, etc.) for development and deployment.
- Reference the [Expo documentation](https://docs.expo.dev/) for APIs and configuration.

## Example Component Skeleton

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

---

For more details, refer to the official [React Native](https://reactnative.dev/docs/environment-setup), [Expo](https://expo.dev/), [`expo-router`](https://expo.github.io/router/docs), and [`nativewind`](https://www.nativewind.dev/) documentation.

## Javascript / TypeScript Conventions

- All import statements should be at the beginning of files before any code
- Use `import { Component } from 'react';` instead of `import React, { Component } from 'react';`
- Always prefer esModules to commonJS and never mix esModule and CommonJS syntax in the same file
