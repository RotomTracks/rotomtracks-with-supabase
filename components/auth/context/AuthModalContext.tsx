'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthModals, AuthModalType } from '../hooks/useAuthModals';

interface AuthModalContextType {
  activeModal: AuthModalType;
  isLoginModalOpen: boolean;
  isSignUpModalOpen: boolean;
  openLoginModal: () => void;
  openSignUpModal: () => void;
  closeModal: () => void;
  switchToLogin: () => void;
  switchToSignUp: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

interface AuthModalProviderProps {
  children: ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const authModals = useAuthModals();

  return (
    <AuthModalContext.Provider value={authModals}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModalContext() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModalContext must be used within an AuthModalProvider');
  }
  return context;
}
