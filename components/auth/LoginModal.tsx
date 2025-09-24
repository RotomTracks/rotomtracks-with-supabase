'use client';

import { AuthModal } from './AuthModal';
import { LoginForm } from '../login-form';
import { useTypedTranslation } from '@/lib/i18n';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
  const { tAuth } = useTypedTranslation();

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={tAuth('login.title')}
    >
      <LoginForm 
        onSuccess={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
        isModal={true}
      />
    </AuthModal>
  );
}
