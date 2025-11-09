import { render, screen } from '@testing-library/react';
import App from './App';
import AuthContext, { AuthProvider } from './contexts/AuthContext';

test('renders welcome message', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const linkElement = screen.getByText(/Welcome to prepAIred/i);
  expect(linkElement).toBeInTheDocument();
});
