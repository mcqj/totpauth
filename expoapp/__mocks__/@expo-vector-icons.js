const React = require('react');

// Create a simple mock that renders a plain View with an accessible label
const { View } = require('react-native');

function IconMock(props) {
  const { name, size, color, testID, accessibilityLabel } = props;
  return React.createElement(View, {
    testID: testID || `icon-${name}`,
    accessibilityLabel: accessibilityLabel || `icon-${name}`,
    style: { width: size || 16, height: size || 16, backgroundColor: 'transparent' },
  });
}

module.exports = new Proxy({}, {
  get: (target, prop) => {
    // Allow imports like require('@expo/vector-icons').FontAwesome
    return IconMock;
  }
});
