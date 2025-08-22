const React = require('react');
const { NavigationContainer } = require('@react-navigation/native');

module.exports = {
  // Provide basic hook implementations that work in tests
  useRouter: () => ({ push: () => {} }),
  useFocusEffect: (cb) => { React.useEffect(cb, []); },
  Stack: {
    Screen: ({ children }) => children,
  },
  useLoadedNavigation: () => ({ push: () => {} }),
  // Export Link/Href placeholders used elsewhere
  Link: ({ children }) => children,
  Href: () => null,
};
