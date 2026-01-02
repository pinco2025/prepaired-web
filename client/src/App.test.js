import { render, screen, act } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

test('renders welcome message', async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  });
  const linkElement = await screen.findByText(/Stop Guessing./i);
  expect(linkElement).toBeInTheDocument();
});
