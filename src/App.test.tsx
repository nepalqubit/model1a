import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders RevX Assistant header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Assistant/i);
  expect(headerElement).toBeInTheDocument();
});
