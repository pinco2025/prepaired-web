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
  // "Welcome to prepAIred" is split across elements, so we look for "Welcome to"
  // or use a custom function if strictness is needed.
  const linkElement = await screen.findByText(/Welcome to/i);
  expect(linkElement).toBeInTheDocument();
});
