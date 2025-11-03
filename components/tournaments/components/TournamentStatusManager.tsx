'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Users,
  Settings
} from 'lucide-react';
import type { Tournament, UserRole } from '@/lib/types/tournament';
import { TournamentStatus } from '@/lib/types/tournament';

interface TournamentStatusManagerProps {
  tournament: Tournament;
  participantCount: number;
  matchesCount: number;
  completedMatches: number;
  onStatusUpdate: (newStatus: string) => void;
  userRole: UserRole;
}

export function TournamentStatusManager({
  tournament,
  participantCount,
  matchesCount,
  completedMatches,
  onStatusUpdate,
  userRole
}: TournamentStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    if (userRole !== 'organizer') {
      setError('Solo el organizador puede cambiar el estado del torneo');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        onStatusUpdate(newStatus);
      } else {
        setError(data.message || 'Error al actualizar el estado');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Próximo',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Calendar className="h-4 w-4" />,
          description: 'El torneo aún no ha comenzado',
          actions: ['ongoing', 'cancelled']
        };
      case 'ongoing':
        return {
          label: 'En Curso',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Play className="h-4 w-4" />,
          description: 'El torneo está actualmente en progreso',
          actions: ['completed', 'cancelled']
        };
      case 'completed':
        return {
          label: 'Completado',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'El torneo ha finalizado',
          actions: ['ongoing'] // Allow reopening if needed
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />,
          description: 'El torneo ha sido cancelado',
          actions: ['upcoming', 'ongoing']
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-4 w-4" />,
          description: 'Estado desconocido',
          actions: []
        };
    }
  };

  const getActionButton = (action: string) => {
    const actionInfo = {
      upcoming: { label: 'Marcar como Próximo', icon: <Calendar className="h-4 w-4" />, variant: 'outline' as const },
      ongoing: { label: 'Iniciar Torneo', icon: <Play className="h-4 w-4" />, variant: 'default' as const },
      completed: { label: 'Marcar como Completado', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' as const },
      cancelled: { label: 'Cancelar Torneo', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' as const }
    };

    const info = actionInfo[action as keyof typeof actionInfo];
    if (!info) return null;

    return (
      <Button
        key={action}
        variant={info.variant}
        size="sm"
        onClick={() => updateStatus(action)}
        disabled={isUpdating}
        className="flex items-center space-x-2"
      >
        {info.icon}
        <span>{info.label}</span>
      </Button>
    );
  };

  const getProgressInfo = () => {
    if (matchesCount === 0) {
      return {
        percentage: 0,
        text: 'Sin partidas registradas',
        color: 'bg-gray-200'
      };
    }

    const percentage = Math.round((completedMatches / matchesCount) * 100);
    
    return {
      percentage,
      text: `${completedMatches} de ${matchesCount} partidas completadas`,
      color: percentage === 100 ? 'bg-green-500' : percentage > 50 ? 'bg-blue-500' : 'bg-yellow-500'
    };
  };

  const shouldAutoComplete = () => {
    return tournament.status === TournamentStatus.ONGOING && 
           matchesCount > 0 && 
           completedMatches === matchesCount;
  };

  const statusInfo = getStatusInfo(tournament.status);
  const progressInfo = getProgressInfo();

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Estado del Torneo</span>
          </CardTitle>
          <CardDescription>
            Gestiona el estado actual del torneo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {statusInfo.icon}
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-900">Estado Actual</p>
                <p className="text-sm text-gray-600">{statusInfo.description}</p>
              </div>
            </div>
            
            {userRole === 'organizer' && (
              <div className="flex items-center space-x-2">
                {statusInfo.actions.map(action => getActionButton(action))}
              </div>
            )}
          </div>

          {/* Tournament Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Progreso del Torneo</span>
              <span className="text-gray-600">{progressInfo.text}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${progressInfo.color}`}
                style={{ width: `${progressInfo.percentage}%` }}
              />
            </div>
          </div>

          {/* Tournament Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{participantCount}</div>
              <div className="text-sm text-gray-600">Participantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedMatches}</div>
              <div className="text-sm text-gray-600">Partidas Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{matchesCount}</div>
              <div className="text-sm text-gray-600">Total Partidas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-completion suggestion */}
      {shouldAutoComplete() && userRole === 'organizer' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Todas las partidas han sido completadas. ¿Quieres marcar el torneo como completado?
            </span>
            <Button
              size="sm"
              onClick={() => updateStatus('completed')}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Torneo
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status-specific alerts */}
      {tournament.status === 'upcoming' && participantCount === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No hay participantes registrados aún. Asegúrate de procesar los datos del torneo antes de iniciarlo.
          </AlertDescription>
        </Alert>
      )}

      {tournament.status === 'ongoing' && matchesCount === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El torneo está marcado como en curso pero no hay partidas registradas. Procesa los datos del torneo.
          </AlertDescription>
        </Alert>
      )}

      {tournament.status === 'completed' && progressInfo.percentage < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El torneo está marcado como completado pero aún hay partidas pendientes ({progressInfo.percentage}% completado).
          </AlertDescription>
        </Alert>
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Permission notice */}
      {userRole !== 'organizer' && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Solo el organizador del torneo puede cambiar el estado del torneo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}