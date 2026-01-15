import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import ManualEntry from '../components/ManualEntry';

// Mock the toast context to avoid animations/timers interfering with test timing.
jest.mock('../contexts/ToastContext', () => ({
  ToastProvider: ({ children }: any) => children,
  useToast: () => ({ show: jest.fn() }),
}));

// Mock the folders context
jest.mock('../contexts/FoldersContext', () => ({
  FoldersProvider: ({ children }: any) => children,
  useFoldersContext: () => ({
    folders: [],
    loading: false,
    add: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    reload: jest.fn(),
  }),
}));

// Mock expo-image-picker to return a fake uri when launched
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  // Newer expo-image-picker returns { canceled: boolean, assets: [{ uri }] }
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/picked.png' }] })),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock expo-image-manipulator to return a manipulated URI
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({ uri: 'file:///tmp/manipulated.jpg' })),
  SaveFormat: { JPEG: 'jpeg' },
}));

// Mock expo-file-system to emulate copy and documentDirectory
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///app-docs/',
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async ({ from, to }: any) => {
    // emulate copy by resolving immediately
    return;
  }),
  deleteAsync: jest.fn(async () => {}),
}));

describe('ManualEntry icon picker', () => {
  test('picking an image results in onSave receiving an icon property', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <ManualEntry onSave={onSave} saveLabel="Save Manual Entry" allowSecretEdit={true} />
    );

    // Fill required fields
    const account = getByPlaceholderText('Account Name');
    const secret = getByPlaceholderText('Secret');

    await act(async () => {
      fireEvent.changeText(account, 'bob@example');
      fireEvent.changeText(secret, 'JBSWY3DPEHPK3PXP');
    });

    // Press the "Choose Icon" button to trigger the mocked image picker
    const chooseBtn = getByText('Choose Icon');
    await act(async () => {
      fireEvent.press(chooseBtn);
    });

    // Now the UI should show the Clear Icon button (image was selected)
    await waitFor(() => {
      expect(queryByText('Clear Icon')).not.toBeNull();
    });

    // Press save
    const saveBtn = getByTestId('manual-save');
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    // Expect onSave to be called and include icon uri
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const calledWith = onSave.mock.calls[0][0];
      // icon should have been copied into the app documentDirectory under icons/
      expect(calledWith).toMatchObject({ accountName: 'bob@example', secret: expect.any(String) });
      expect(calledWith.icon).toBeDefined();
      expect(String(calledWith.icon)).toMatch(/^file:\/\/\/app-docs\/icons\/icon_\d+\.jpg$/);
    });
  });
});
