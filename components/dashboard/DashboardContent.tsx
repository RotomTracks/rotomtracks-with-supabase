'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTypedTranslation } from '@/lib/i18n';
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
  const { tPages } = useTypedTranslation();
  const isOrganizer = profile?.user_role === 'organizer' || profile?.user_role === 'admin';
  
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
      case 'completed': return tPages('dashboard.stats.completed');
      case 'ongoing': return tPages('dashboard.stats.ongoing');
      case 'upcoming': return tPages('dashboard.stats.upcoming');
      case 'cancelled': return tPages('dashboard.stats.cancelled');
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
          <h1 className="text-3xl font-bold text-foreground">
            {tPages('dashboard.welcome', { name: profile?.full_name || user.email })}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isOrganizer 
              ? tPages('dashboard.organizerSubtitle')
              : tPages('dashboard.playerSubtitle')
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/tournaments">
            <Button variant="outline" className="rounded-xl border-2 hover:shadow-lg transition-all duration-200">
              <Search className="h-4 w-4 mr-2" />
              {tPages('dashboard.searchTournaments')}
            </Button>
          </Link>
          {isOrganizer && (
            <Link href="/tournaments/create">
              <Button className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                {tPages('dashboard.newTournament')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isOrganizer ? (
          <>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTournaments}</div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.organizedTournaments')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeTournaments}</div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.ongoing')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.completedTournaments}</div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.completed')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userTournaments.reduce((sum, t) => sum + t.current_players, 0)}
                </div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.totalParticipants')}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.participations}</div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.participations')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {participatingTournaments.filter(p => p.tournaments.status === 'ongoing').length}
                </div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.activeTournaments')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {participatingTournaments.filter(p => p.tournaments.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.completed')}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {participatingTournaments.filter(p => p.tournaments.status === 'upcoming').length}
                </div>
                <div className="text-sm text-muted-foreground">{tPages('dashboard.stats.upcoming')}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User's Tournaments */}
        <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Trophy className="h-5 w-5 text-primary" />
              <span>
                {isOrganizer ? tPages('dashboard.sections.myTournaments') : tPages('dashboard.sections.myParticipations')}
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isOrganizer 
                ? tPages('dashboard.sections.organizerDescription')
                : tPages('dashboard.sections.playerDescription')
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
                      className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/50 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{tournament.name}</h4>
                          <Badge className={`${getStatusColor(tournament.status)} rounded-full`}>
                            {getStatusText(tournament.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
                          <Button size="sm" variant="outline" className="rounded-xl">
                            {tPages('dashboard.actions.view')}
                          </Button>
                        </Link>
                        {isOrganizer && tournament.organizer_id === user.id && (
                          <Link href={`/tournaments/${tournament.id}/manage`}>
                            <Button size="sm" className="rounded-xl">
                              <Settings className="h-4 w-4 mr-1" />
                              {tPages('dashboard.actions.manage')}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                
                {(isOrganizer ? userTournaments : participatingTournaments).length > 5 && (
                  <div className="text-center pt-3">
                    <Link href="/tournaments">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        {tPages('dashboard.actions.viewAll')}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>
                  {isOrganizer 
                    ? tPages('dashboard.empty.noTournamentsOrganized')
                    : tPages('dashboard.empty.noParticipations')
                  }
                </p>
                <Link href="/tournaments">
                  <Button className="mt-4 rounded-xl">
                    <Search className="h-4 w-4 mr-2" />
                    {tPages('dashboard.empty.exploreTournaments')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tournaments */}
        <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>{tPages('dashboard.sections.recentTournaments')}</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {tPages('dashboard.sections.recentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTournaments.length > 0 ? (
              <div className="space-y-3">
                {recentTournaments.slice(0, 5).map((tournament) => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/50 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{tournament.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
                      <Button size="sm" variant="outline" className="rounded-xl">
                        {tPages('dashboard.actions.viewResults')}
                      </Button>
                    </Link>
                  </div>
                ))}
                
                <div className="text-center pt-3">
                  <Link href="/tournaments">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      {tPages('dashboard.actions.viewMore')}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{tPages('dashboard.empty.noRecentTournaments')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile completion alert */}
      {!profile?.full_name && (
        <Alert className="rounded-2xl border-2 bg-gray-50 dark:bg-gray-800">
          <Settings className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-foreground">
              {tPages('dashboard.alerts.completeProfile')}
            </span>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="rounded-xl">
                {tPages('dashboard.alerts.completeProfileAction')}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}