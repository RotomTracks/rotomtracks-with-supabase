'use client';

import { useState, useCallback } from 'react';

export type AuthModalType = 'login' | 'signup' | null;

export function useAuthModals() {
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const openLoginModal = useCallback(() => {
    setActiveModal('login');
  }, []);

  const openSignUpModal = useCallback(() => {
    setActiveModal('signup');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const switchToLogin = useCallback(() => {
    setActiveModal('login');
  }, []);

  const switchToSignUp = useCallback(() => {
    setActiveModal('signup');
  }, []);

  return {
    activeModal,
    isLoginModalOpen: activeModal === 'login',
    isSignUpModalOpen: activeModal === 'signup',
    openLoginModal,
    openSignUpModal,
    closeModal,
    switchToLogin,
    switchToSignUp,
  };
}
