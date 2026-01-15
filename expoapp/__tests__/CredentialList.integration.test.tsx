import { render } from '@testing-library/react-native';

// Register this mock before importing modules that use it so Jest will
// apply the mock when the module is evaluated (Jest hoists top-level
// jest.mock calls). Keep the mock above any imports of the module-under-test.
// Register this mock before importing modules that use it so Jest will
jest.mock('../hooks/useCredentials');
jest.mock('../hooks/useFolders');
// Use Jest's requireMock to synchronously access the mocked module (avoids
// runtime import() and keeps ES-style code without using CommonJS require()).
const mockUseCredentials = jest.requireMock('../hooks/useCredentials').default as jest.Mock;
const mockUseFolders = jest.requireMock('../hooks/useFolders').default as jest.Mock;

import CredentialListScreen from '../app/credential-list';
import { renderWithProviders } from '../tests/utils';

describe('CredentialListScreen integration', () => {
  beforeEach(() => {
    mockUseCredentials.mockReset();
    mockUseFolders.mockReset();
  });

  test('shows empty state when no credentials', () => {
    mockUseCredentials.mockImplementation(() => ({
      credentials: [],
      loading: false,
      add: jest.fn(),
      remove: jest.fn(),
      reload: jest.fn(),
    }));
    
    mockUseFolders.mockImplementation(() => ({
      folders: [],
      loading: false,
      add: jest.fn(),
      remove: jest.fn(),
      reload: jest.fn(),
    }));

  const { getByText } = renderWithProviders(<CredentialListScreen />);

    expect(getByText('No folders or credentials saved.')).toBeTruthy();
  });

  test('renders items when credentials exist', () => {
    mockUseCredentials.mockImplementation(() => ({
      credentials: [
        { _key: 'k1', accountName: 'alice@example.com', issuer: 'Ex', secret: 'S' },
      ],
      loading: false,
      add: jest.fn(),
      remove: jest.fn(),
      reload: jest.fn(),
    }));
    
    mockUseFolders.mockImplementation(() => ({
      folders: [],
      loading: false,
      add: jest.fn(),
      remove: jest.fn(),
      reload: jest.fn(),
    }));

  const { getByText } = renderWithProviders(<CredentialListScreen />);

    expect(getByText('alice@example.com')).toBeTruthy();
  });
});
