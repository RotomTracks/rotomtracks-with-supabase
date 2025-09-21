'use client';

// React
import { useState, useEffect } from 'react';

// Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Settings, 
  Download,
  Upload,
  Calendar,
  MapPin,
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus
} from 'lucide-react';

// Types
import type { Tournament, TournamentStatus, UserRole } from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  getStatusColor,
  getStatusText,
  STATUS_TRANSLATIONS
} from '@/lib/utils/tournament-status';



interface TournamentManagementPageProps {
  tournamentId: string;
  user: any;
  userRole?: UserRole;
}

export function TournamentManagementPage({ 
  tournamentId, 
  user, 
  userRole = 'organizer' 
}: TournamentManagementPageProps) {
  // Hooks
  const router = useRouter();
  const { formatDate, formatTime, formatDateTime } = useTournamentFormatting();
  
  // State
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Torneo no encontrado');
        } else if (response.status === 403) {
          setError('No tienes permisos para gestionar este torneo');
        } else {
          setError('Error al cargar el torneo');
        }
        return;
      }

      const data = await response.json();
      setTournament(data.tournament);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions using centralized status management
  const getStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status as TournamentStatus)}>
        {getStatusText(status as TournamentStatus)}
      </Badge>
    );
  };

  // Render loading state with better accessibility
  const renderLoadingState = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8" role="status" aria-label="Cargando gestión de torneo">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Cargando gestión de torneo...</span>
      </div>
    </div>
  );

  if (loading) return renderLoadingState();

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center" role="alert">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {error || 'Torneo no encontrado'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudo cargar la información del torneo.
            </p>
            <Link href="/dashboard">
              <Button>
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.city}, {tournament.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.start_date, 'long')}</span>
                </div>
                {getStatusBadge(tournament.status)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href={`/tournaments/${tournament.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Ver Torneo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Participantes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {tournament.current_players}
                    {tournament.max_players && `/${tournament.max_players}`}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getStatusText(tournament.status as TournamentStatus)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registro</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {tournament.registration_open ? 'Abierto' : 'Cerrado'}
                  </p>
                </div>
                <UserPlus className={`h-8 w-8 ${tournament.registration_open ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {tournament.tournament_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Torneo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                    <p className="text-gray-900 dark:text-gray-100">{tournament.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</label>
                    <p className="text-gray-900 dark:text-gray-100">{tournament.tournament_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ubicación</label>
                    <p className="text-gray-900 dark:text-gray-100">{tournament.city}, {tournament.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de inicio</label>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(tournament.start_date, 'long')}</p>
                  </div>
                  {tournament.end_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de fin</label>
                      <p className="text-gray-900 dark:text-gray-100">{formatDate(tournament.end_date, 'long')}</p>
                    </div>
                  )}
                  {tournament.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Descripción</label>
                      <p className="text-gray-900 dark:text-gray-100">{tournament.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Gestiona tu torneo de forma rápida
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Archivo TDF
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar TDF Actualizado
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Participantes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Torneo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Participantes Registrados</CardTitle>
                <CardDescription>
                  Gestiona los jugadores registrados en tu torneo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Sistema de participantes en desarrollo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pronto podrás gestionar los participantes de tu torneo aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Archivos del Torneo</CardTitle>
                <CardDescription>
                  Gestiona los archivos TDF y otros documentos del torneo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Sistema de archivos en desarrollo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pronto podrás subir y gestionar archivos TDF aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Torneo</CardTitle>
                <CardDescription>
                  Modifica la configuración y ajustes del torneo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Configuración en desarrollo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pronto podrás modificar la configuración del torneo aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}