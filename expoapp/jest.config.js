module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
  ],
  moduleNameMapper: {
  '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
  '^@expo/vector-icons(.*)$': '<rootDir>/__mocks__/@expo-vector-icons.jsx'
  }
  ,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
