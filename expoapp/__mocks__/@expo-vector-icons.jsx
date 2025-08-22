import { View } from 'react-native';

function IconMock(props) {
  const { name, size, color, testID, accessibilityLabel } = props;
  return (
    <View
      testID={testID || `icon-${name}`}
      accessibilityLabel={accessibilityLabel || `icon-${name}`}
      style={{ width: size || 16, height: size || 16, backgroundColor: 'transparent' }}
    />
  );
}

// Export common icon families by name so imports like
// `import { FontAwesome } from '@expo/vector-icons'` work in tests.
export const FontAwesome = IconMock;
export const MaterialIcons = IconMock;
export const Ionicons = IconMock;
export default IconMock;
