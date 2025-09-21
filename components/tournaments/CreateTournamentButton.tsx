'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CreateTournamentButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CreateTournamentButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: CreateTournamentButtonProps) {
  return (
    <Link href="/tournaments/create">
      <Button 
        variant={variant} 
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <Plus className="h-4 w-4" />
        Crear Torneo
      </Button>
    </Link>
  );
}