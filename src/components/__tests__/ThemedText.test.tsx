import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';

test('renders text correctly', () => {
  const { getByText } = render(<ThemedText>Hello</ThemedText>);
  expect(getByText('Hello')).toBeTruthy();
}); 