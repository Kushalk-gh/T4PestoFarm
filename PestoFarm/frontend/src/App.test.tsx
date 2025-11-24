// Mock all external dependencies before importing App
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => null,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
}));

// Mock AuthContext
jest.mock('./AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock Navbar component
jest.mock('./customer/components/Navbar/navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Since the app renders different components based on auth state,
  // just check that it renders without throwing an error
  expect(document.body).toBeInTheDocument();
});
