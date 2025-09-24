'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}: AuthModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-md w-full mx-4 p-0 gap-0",
          "bg-background border-0",
          "rounded-2xl shadow-2xl",
          className
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 pt-0">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
