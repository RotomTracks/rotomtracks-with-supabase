'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  UserPlus,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
  tournament_type: string;
  city: string;
  country: string;
  start_date: string;
  end_date?: string;
  status: string;
  current_players: number;
  max_players?: number;
  registration_open: boolean;
  organizer_id: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface TournamentCardProps {
  tournament: Tournament;
  viewMode: 'grid' | 'list';
  userRole: 'authenticated' | 'guest';
}

export function TournamentCard({ tournament, viewMode, userRole }: TournamentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'ongoing': return 'En Curso';
      case 'upcoming': return 'Próximo';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getTournamentTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('vgc')) return '🎮';
    if (type.toLowerCase().includes('tcg')) return '🃏';
    if (type.toLowerCase().includes('go')) return '📱';
    return '🏆';
  };

  const getCapacityColor = (current: number, max?: number) => {
    if (!max) return 'text-gray-600';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const isUpcoming = tournament.status === 'upcoming';
  const isOngoing = tournament.status === 'ongoing';
  const canRegister = tournament.registration_open && isUpcoming;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getTournamentTypeIcon(tournament.tournament_type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {tournament.name}
                    </h3>
                    <Badge className={getStatusColor(tournament.status)}>
                      {getStatusText(tournament.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tournament.tournament_type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.start_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(tournament.start_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.city}, {tournament.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
                    {tournament.current_players}
                    {tournament.max_players && `/${tournament.max_players}`}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {tournament.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {canRegister && userRole === 'authenticated' && (
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Registrarse
                </Button>
              )}
              <Link href={`/tournaments/${tournament.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-xl">{getTournamentTypeIcon(tournament.tournament_type)}</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-2">
                {tournament.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {tournament.tournament_type}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(tournament.status)}>
            {getStatusText(tournament.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tournament.start_date)} • {formatTime(tournament.start_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{tournament.city}, {tournament.country}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-600" />
            <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
              {tournament.current_players} participantes
              {tournament.max_players && (
                <span className="text-gray-500"> / {tournament.max_players}</span>
              )}
            </span>
          </div>
          
          {tournament.max_players && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  (tournament.current_players / tournament.max_players) >= 0.9 ? 'bg-red-500' :
                  (tournament.current_players / tournament.max_players) >= 0.7 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (tournament.current_players / tournament.max_players) * 100)}%` 
                }}
              />
            </div>
          )}
          
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {tournament.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          {canRegister && userRole === 'authenticated' && (
            <Button size="sm" className="flex-1">
              <UserPlus className="h-4 w-4 mr-1" />
              Registrarse
            </Button>
          )}
          <Link href={`/tournaments/${tournament.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalles
            </Button>
          </Link>
        </div>
        
        {canRegister && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <UserPlus className="h-3 w-3 mr-1" />
              Registro Abierto
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}