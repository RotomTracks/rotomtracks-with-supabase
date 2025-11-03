'use client';

import { AuthModal } from './AuthModal';
import { SignUpForm } from '../forms/SignUpForm';
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
      className="sm:max-w-lg max-w-sm"
    >
      <SignUpForm 
        onSuccess={onClose}
        onSwitchToLogin={onSwitchToLogin}
        isModal={true}
      />
    </AuthModal>
  );
}
