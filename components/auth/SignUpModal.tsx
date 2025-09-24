'use client';

import { AuthModal } from './AuthModal';
import { SignUpForm } from '../sign-up-form';
import { useTypedTranslation } from '@/lib/i18n';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps) {
  const { tAuth } = useTypedTranslation();

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={tAuth('signUp.title')}
      className="sm:max-w-2xl"
    >
      <SignUpForm 
        onSuccess={onClose}
        onSwitchToLogin={onSwitchToLogin}
        isModal={true}
      />
    </AuthModal>
  );
}
