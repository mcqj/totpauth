// Create a simple mock that renders a plain View with an accessible label
const { View } = require('react-native');

function IconMock(props) {
  const { name, size, color, testID, accessibilityLabel } = props;
  // Return JSX using the automatic JSX runtime (no top-level React import needed)
  return (
    <View
      testID={testID || `icon-${name}`}
      accessibilityLabel={accessibilityLabel || `icon-${name}`}
      style={{ width: size || 16, height: size || 16, backgroundColor: 'transparent' }}
    />
  );
}

module.exports = new Proxy({}, {
  get: (target, prop) => {
    // Allow imports like require('@expo/vector-icons').FontAwesome
    return IconMock;
  }
});
