'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTypedTranslation } from '@/lib/i18n';

interface CreateTournamentButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  centered?: boolean;
}

export function CreateTournamentButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  centered = false
}: CreateTournamentButtonProps) {
  const { tTournaments } = useTypedTranslation();
  
  return (
    <div className={centered ? 'flex justify-center' : ''}>
      <Link href="/tournaments/create">
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500 dark:hover:border-blue-600 ${className}`}
        >
          <Plus className="h-4 w-4" />
          {tTournaments('dashboard.actions.createTournament')}
        </Button>
      </Link>
    </div>
  );
}