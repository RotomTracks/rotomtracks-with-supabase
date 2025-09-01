'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Settings,
  Search,
  TrendingUp,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface Tournament {
  id: string;
  name: string;
  tournament_type: string;
  city: string;
  country: string;
  start_date: string;
  status: string;
  current_players: number;
  organizer_id?: string;
}

interface ParticipatingTournament {
  tournament_id: string;
  status: string;
  tournaments: Tournament;
}

interface DashboardContentProps {
  user: User;
  profile: any;
  userTournaments: Tournament[];
  participatingTournaments: ParticipatingTournament[];
  recentTournaments: Tournament[];
}

export function DashboardContent({
  user,
  profile,
  userTournaments,
  participatingTournaments,
  recentTournaments
}: DashboardContentProps) {
  const isOrganizer = profile?.user_role === 'organizer';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Calculate statistics
  const stats = {
    totalTournaments: userTournaments.length,
    activeTournaments: userTournaments.filter(t => t.status === 'ongoing').length,
    completedTournaments: userTournaments.filter(t => t.status === 'completed').length,
    participations: participatingTournaments.length,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {profile?.full_name || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isOrganizer 
              ? 'Gestiona tus torneos y revisa los resultados' 
              : 'Descubre torneos y sigue tus participaciones'
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/tournaments">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar Torneos
            </Button>
          </Link>
          {isOrganizer && (
            <Link href="/tournaments/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Torneo
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isOrganizer ? (
          <>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalTournaments}</div>
                <div className="text-sm text-gray-600">Torneos Organizados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{stats.activeTournaments}</div>
                <div className="text-sm text-gray-600">En Curso</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{stats.completedTournaments}</div>
                <div className="text-sm text-gray-600">Completados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {userTournaments.reduce((sum, t) => sum + t.current_players, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Participantes</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{stats.participations}</div>
                <div className="text-sm text-gray-600">Participaciones</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {participatingTournaments.filter(p => p.tournaments.status === 'ongoing').length}
                </div>
                <div className="text-sm text-gray-600">Torneos Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {participatingTournaments.filter(p => p.tournaments.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {participatingTournaments.filter(p => p.tournaments.status === 'upcoming').length}
                </div>
                <div className="text-sm text-gray-600">Próximos</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User's Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>
                {isOrganizer ? 'Mis Torneos' : 'Mis Participaciones'}
              </span>
            </CardTitle>
            <CardDescription>
              {isOrganizer 
                ? 'Torneos que has organizado recientemente'
                : 'Torneos en los que has participado'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(isOrganizer ? userTournaments : participatingTournaments.map(p => p.tournaments)).length > 0 ? (
              <div className="space-y-3">
                {(isOrganizer ? userTournaments : participatingTournaments.map(p => p.tournaments))
                  .slice(0, 5)
                  .map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{tournament.name}</h4>
                          <Badge className={getStatusColor(tournament.status)}>
                            {getStatusText(tournament.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{tournament.city}, {tournament.country}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(tournament.start_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{tournament.current_players}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/tournaments/${tournament.id}`}>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </Link>
                        {isOrganizer && tournament.organizer_id === user.id && (
                          <Link href={`/tournaments/${tournament.id}/manage`}>
                            <Button size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Gestionar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                
                {(isOrganizer ? userTournaments : participatingTournaments).length > 5 && (
                  <div className="text-center pt-3">
                    <Link href="/tournaments">
                      <Button variant="outline" size="sm">
                        Ver todos
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {isOrganizer 
                    ? 'No has organizado ningún torneo aún'
                    : 'No has participado en ningún torneo aún'
                  }
                </p>
                <Link href="/tournaments">
                  <Button className="mt-4">
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Torneos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Torneos Recientes</span>
            </CardTitle>
            <CardDescription>
              Descubre torneos completados recientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTournaments.length > 0 ? (
              <div className="space-y-3">
                {recentTournaments.slice(0, 5).map((tournament) => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{tournament.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{tournament.city}, {tournament.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(tournament.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{tournament.current_players}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/tournaments/${tournament.id}`}>
                      <Button size="sm" variant="outline">
                        Ver Resultados
                      </Button>
                    </Link>
                  </div>
                ))}
                
                <div className="text-center pt-3">
                  <Link href="/tournaments">
                    <Button variant="outline" size="sm">
                      Ver más torneos
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay torneos recientes disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile completion alert */}
      {!profile?.full_name && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Completa tu perfil para obtener una mejor experiencia en la plataforma.
            </span>
            <Link href="/profile">
              <Button size="sm" variant="outline">
                Completar Perfil
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}