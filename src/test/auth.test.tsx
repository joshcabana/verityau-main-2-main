import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Auth from '@/pages/Auth';

// Mock the hooks
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithApple = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
    resetPassword: mockResetPassword,
    user: null,
    loading: false,
  }),
}));

// Mock useReducedMotion hook
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
  default: () => false,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock motion components
vi.mock('@/components/motion', () => ({
  FadeIn: ({ children, className }: any) => <div className={className}>{children}</div>,
  StaggerContainer: ({ children }: any) => <div>{children}</div>,
  StaggerItem: ({ children }: any) => <div>{children}</div>,
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
};

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form by default', () => {
      renderAuth();
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders Verity logo and branding', () => {
      renderAuth();
      
      expect(screen.getByText('Verity')).toBeInTheDocument();
    });

    it('renders social login buttons', () => {
      renderAuth();
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument();
    });

    it('renders terms and privacy links', () => {
      renderAuth();
      
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });

  describe('Form switching', () => {
    it('switches to signup form when clicking sign up link', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      await user.click(screen.getByText(/sign up/i));
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('switches back to login form when clicking sign in link', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      // First switch to signup
      await user.click(screen.getByText(/sign up/i));
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      
      // Then switch back to login
      await user.click(screen.getByText(/sign in/i));
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('shows forgot password form when clicking forgot password', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      await user.click(screen.getByText(/forgot password/i));
      
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('does not call signIn with invalid email', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // signIn should not be called with invalid input
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('does not call signIn with short password', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // signIn should not be called with invalid input
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Form submission', () => {
    it('calls signIn with email and password on login submit', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('calls signUp with email and password on signup submit', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      // Switch to signup
      await user.click(screen.getByText(/sign up/i));
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
      });
    });

    it('calls resetPassword with email on password reset submit', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      // Go to reset password
      await user.click(screen.getByText(/forgot password/i));
      
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));
      
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Social login', () => {
    it('calls signInWithGoogle when clicking Google button', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      await user.click(screen.getByRole('button', { name: /continue with google/i }));
      
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it('calls signInWithApple when clicking Apple button', async () => {
      const user = userEvent.setup();
      renderAuth();
      
      await user.click(screen.getByRole('button', { name: /continue with apple/i }));
      
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('has a back to home link', () => {
      renderAuth();
      
      const homeLink = screen.getByRole('link', { name: /back to home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});

