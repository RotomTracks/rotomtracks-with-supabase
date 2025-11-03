'use client';

import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { useAuthModalContext } from '../context/AuthModalContext';

export function AuthModals() {
  const {
    isLoginModalOpen,
    isSignUpModalOpen,
    closeModal,
    switchToLogin,
    switchToSignUp,
  } = useAuthModalContext();

  return (
    <>
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeModal}
          onSwitchToSignUp={switchToSignUp}
        />
      )}
      {isSignUpModalOpen && (
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={closeModal}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
}

// Export the hook for use in other components
export { useAuthModalContext };
