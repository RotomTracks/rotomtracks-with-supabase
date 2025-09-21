"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl'
};

export function Avatar({ 
  firstName, 
  lastName, 
  email, 
  size = 'md', 
  className 
}: AvatarProps) {
  // Generate initials from available data
  const generateInitials = (firstName?: string, lastName?: string, email?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const initials = generateInitials(firstName, lastName, email);

  return (
    <div 
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}