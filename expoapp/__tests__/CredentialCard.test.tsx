import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../tests/utils';

// Mock generateTotp so the component shows a deterministic code in tests
jest.mock('../utils/generateTotp', () => ({
  generateTotp: jest.fn(() => '123456'),
}));

// Mock FontAwesome to avoid updates that require wrapping in act()
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: () => null,
}));

import CredentialCard from '../components/CredentialCard';
import { generateTotp } from '../utils/generateTotp';

describe('CredentialCard', () => {
  test('renders account, issuer and code, and calls onDelete when delete pressed', () => {
    const credential = {
      _key: 'key1',
      accountName: 'alice@example.com',
      issuer: 'Example',
      secret: 'JBSWY3DPEHPK3PXP',
    } as any;

    const onDelete = jest.fn();

    // cast render result to any to access accessibility query helpers without
    // TypeScript complaints in this simple test harness
    const { getByText, getByTestId } = render(
      <CredentialCard credential={credential} onDelete={onDelete} />
    );

    // Account name and issuer should render
    expect(getByText('alice@example.com')).toBeTruthy();
    expect(getByText('Issuer: Example')).toBeTruthy();

  // The mocked code should be rendered somewhere within the component
  expect(getByText(/123456/)).toBeTruthy();

    // generateTotp was called with the secret
    expect(generateTotp).toHaveBeenCalledWith(credential.secret);

    // Pressing delete should call the callback
  const deleteBtn = getByTestId('delete-alice@example.com');
  fireEvent.press(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
