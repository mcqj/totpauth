import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('../hooks/useCredentials');
const mockUseCredentials = require('../hooks/useCredentials').default as jest.Mock;

import CredentialListScreen from '../app/credential-list';
import { renderWithProviders } from '../tests/utils';

describe('CredentialListScreen integration', () => {
  beforeEach(() => mockUseCredentials.mockReset());

  test('shows empty state when no credentials', () => {
    mockUseCredentials.mockImplementation(() => ({
      credentials: [],
      loading: false,
      add: jest.fn(),
      remove: jest.fn(),
      reload: jest.fn(),
    }));

  const { getByText } = renderWithProviders(<CredentialListScreen />);

    expect(getByText('No credentials saved.')).toBeTruthy();
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

  const { getByText } = renderWithProviders(<CredentialListScreen />);

    expect(getByText('alice@example.com')).toBeTruthy();
  });
});
