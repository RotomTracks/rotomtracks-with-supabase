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
          "w-[95vw] max-w-md mx-auto p-0 gap-0",
          "bg-background border-0",
          "rounded-xl sm:rounded-2xl shadow-2xl",
          "max-h-[85vh] flex flex-col",
          "sm:w-full sm:mx-4 sm:max-h-[95vh]",
          "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
          className
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        {/* Header - Fixed */}
        <DialogHeader className="p-3 sm:p-6 pb-2 flex-shrink-0">
          <DialogTitle className="text-base sm:text-xl font-bold text-center text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="px-3 sm:px-6 pb-3 sm:pb-6 pt-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
