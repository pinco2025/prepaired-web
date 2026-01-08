import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock IntersectionObserver
const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.IntersectionObserver = mockIntersectionObserver;

test('renders welcome message', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const linkElement = await screen.findByText(/Stop Panicking/i);
  expect(linkElement).toBeInTheDocument();
});