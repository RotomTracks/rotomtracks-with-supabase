import { useState } from 'react';
import { useTypedTranslation } from '@/lib/i18n/';
import { useToast } from '@/components/ui/toast';

interface UseTournamentRegistrationProps {
  tournamentId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useTournamentRegistration({ 
  tournamentId, 
  onSuccess, 
  onError 
}: UseTournamentRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { tUI } = useTypedTranslation();
  const { addToast } = useToast();

  const registerForTournament = async () => {
    if (isLoading || !tournamentId) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        let errorMessage = result.error || tUI('messages.error.unexpectedError');
        
        // Map specific error codes to user-friendly messages
        if (result.code === 'UNAUTHORIZED') {
          errorMessage = tUI('messages.error.unauthorized');
        } else if (result.code === 'NOT_FOUND' && result.message?.includes('Perfil')) {
          errorMessage = tUI('messages.error.profileRequired');
        } else if (result.code === 'NOT_FOUND' && result.message?.includes('Torneo')) {
          errorMessage = tUI('messages.error.tournamentNotFound');
        } else if (result.code === 'VALIDATION_ERROR' && result.message?.includes('cerradas')) {
          errorMessage = tUI('messages.error.registrationClosed');
        } else if (result.code === 'VALIDATION_ERROR' && result.message?.includes('próximos')) {
          errorMessage = tUI('messages.error.onlyUpcomingTournaments');
        } else if (result.code === 'DUPLICATE_REGISTRATION') {
          errorMessage = tUI('messages.error.alreadyRegistered');
        }
        
        throw new Error(errorMessage);
      }

      // Success
      onSuccess?.();
      
      // Show success toast
      addToast({
        type: 'success',
        title: tUI('messages.success.registrationSuccess'),
        message: result.message || tUI('messages.success.registrationComplete')
      });

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : tUI('messages.error.unexpectedError');
      
      // Show error toast
      addToast({
        type: 'error',
        title: tUI('messages.error.registrationError'),
        message: errorMessage
      });
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unregisterFromTournament = async () => {
    if (isLoading || !tournamentId) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.error || tUI('messages.error.unexpectedError');
        
        if (result.code === 'UNAUTHORIZED') {
          errorMessage = tUI('messages.error.unauthorized');
        } else if (result.code === 'NOT_FOUND') {
          errorMessage = tUI('messages.error.registrationNotFound');
        }
        
        throw new Error(errorMessage);
      }

      // Success
      onSuccess?.();
      
      // Show success toast
      addToast({
        type: 'success',
        title: tUI('messages.success.unregistrationSuccess'),
        message: result.message || tUI('messages.success.unregistrationComplete')
      });

    } catch (error) {
      console.error('Unregistration error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : tUI('messages.error.unexpectedError');
      
      // Show error toast
      addToast({
        type: 'error',
        title: tUI('messages.error.unregistrationError'),
        message: errorMessage
      });
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerForTournament,
    unregisterFromTournament,
    isLoading
  };
}