'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { TournamentType } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';
import Link from 'next/link';

interface CreateTournamentFormProps {
  user: any;
}

interface FormData {
  name: string;
  tournament_type: TournamentType;
  official_tournament_id: string;
  city: string;
  country: string;
  state: string;
  start_date: string;
  end_date: string;
  max_players: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CreateTournamentForm({ user }: CreateTournamentFormProps) {
  const { tTournaments, tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    tournament_type: TournamentType.TCG_LEAGUE_CUP,
    official_tournament_id: '',
    city: '',
    country: 'España',
    state: '',
    start_date: '',
    end_date: '',
    max_players: '',
    description: ''
  });

  const tournamentTypes = [
    { value: TournamentType.TCG_PRERELEASE, label: 'TCG Prerelease', icon: '📦' },
    { value: TournamentType.TCG_LEAGUE_CHALLENGE, label: 'TCG League Challenge', icon: '⚔️' },
    { value: TournamentType.TCG_LEAGUE_CUP, label: 'TCG League Cup', icon: '🃏' },
    { value: TournamentType.VGC_PREMIER_EVENT, label: 'VGC Premier Event', icon: '🎮' },
    { value: TournamentType.GO_PREMIER_EVENT, label: 'Pokémon GO Premier Event', icon: '📱' },
  ];

  const countries = [
    'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela', 
    'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Costa Rica', 'Panamá', 
    'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'República Dominicana', 
    'Puerto Rico', 'Cuba', 'Andorra', 'Portugal', 'Francia', 'Italia', 'Alemania',
    'Reino Unido', 'Estados Unidos', 'Canadá', 'Brasil', 'Otro'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del torneo es obligatorio';
    }

    if (!formData.official_tournament_id.trim()) {
      newErrors.official_tournament_id = 'El ID oficial del torneo es obligatorio';
    } else if (!/^[0-9]{2}-[0-9]{2}-[0-9]{6}$/.test(formData.official_tournament_id)) {
      newErrors.official_tournament_id = 'Formato inválido. Use: YY-MM-XXXXXX (ej: 24-05-002583)';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es obligatoria';
    }

    // Date validation
    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    if (formData.end_date && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }

    // Max players validation
    if (formData.max_players) {
      const maxPlayers = parseInt(formData.max_players);
      if (isNaN(maxPlayers) || maxPlayers < 4) {
        newErrors.max_players = 'El número mínimo de jugadores es 4';
      } else if (maxPlayers > 1000) {
        newErrors.max_players = 'El número máximo de jugadores es 1000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const tournamentData = {
        ...formData,
        max_players: formData.max_players ? parseInt(formData.max_players) : undefined,
        end_date: formData.end_date || undefined,
        state: formData.state || undefined,
        description: formData.description || undefined,
      };

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'Tournament with this official ID already exists') {
          setErrors({ official_tournament_id: 'Ya existe un torneo con este ID oficial' });
        } else if (result.details) {
          // Handle validation errors from server
          const serverErrors: FormErrors = {};
          result.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              serverErrors[error.path[0]] = error.message;
            }
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: result.message || 'Error al crear el torneo' });
        }
        return;
      }

      setSuccess(true);
      
      // Redirect to tournament management page after a short delay
      setTimeout(() => {
        router.push(`/tournaments/${result.tournament.id}/manage`);
      }, 2000);

    } catch (error) {
      console.error('Error creating tournament:', error);
      setErrors({ general: 'Error de conexión. Por favor, inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Torneo creado exitosamente!
            </h3>
            <p className="text-gray-600 mb-4">
              Redirigiendo a la página de gestión del torneo...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General error */}
      {errors.general && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errors.general}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Datos principales del torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-foreground">Nombre del Torneo *</Label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.name ? 'border-destructive/30' : 'border-border'
                  }`}
                  placeholder="ej: Regional Championship Madrid 2024"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tournament_type" className="text-foreground">Tipo de Torneo *</Label>
                <select
                  id="tournament_type"
                  value={formData.tournament_type}
                  onChange={(e) => handleInputChange('tournament_type', e.target.value as TournamentType)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-border"
                >
                  {tournamentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="official_tournament_id" className="text-foreground">ID Oficial del Torneo *</Label>
                <input
                  id="official_tournament_id"
                  type="text"
                  value={formData.official_tournament_id}
                  onChange={(e) => handleInputChange('official_tournament_id', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.official_tournament_id ? 'border-destructive/30' : 'border-border'
                  }`}
                  placeholder="24-05-002583"
                />
                {errors.official_tournament_id && (
                  <p className="text-destructive text-sm mt-1">{errors.official_tournament_id}</p>
                )}
                <p className="text-muted-foreground text-sm mt-1">
                  Formato: YY-MM-XXXXXX (año-mes-número secuencial)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={tTournaments('createForm.descriptionPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <CardDescription>
              Dónde se realizará el torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-foreground">Ciudad *</Label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.city ? 'border-destructive/30' : 'border-border'
                  }`}
                  placeholder={tTournaments('createForm.cityPlaceholder')}
                />
                {errors.city && (
                  <p className="text-destructive text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state" className="text-foreground">Estado/Provincia</Label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-border"
                  placeholder={tTournaments('createForm.statePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-foreground">País *</Label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-border"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5" />
              Fecha y Hora
            </CardTitle>
            <CardDescription>
              Cuándo se realizará el torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-foreground">Fecha y Hora de Inicio *</Label>
                <input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.start_date ? 'border-destructive/30' : 'border-border'
                  }`}
                />
                {errors.start_date && (
                  <p className="text-destructive text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date" className="text-foreground">Fecha y Hora de Fin</Label>
                <input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.end_date ? 'border-destructive/30' : 'border-border'
                  }`}
                />
                {errors.end_date && (
                  <p className="text-destructive text-sm mt-1">{errors.end_date}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Opcional - se puede actualizar después
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Participantes
            </CardTitle>
            <CardDescription>
              Configuración de participantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="max_players" className="text-foreground">Número Máximo de Jugadores</Label>
              <input
                id="max_players"
                type="number"
                min="4"
                max="1000"
                value={formData.max_players}
                onChange={(e) => handleInputChange('max_players', e.target.value)}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.max_players ? 'border-destructive/30' : 'border-border'
                }`}
                placeholder="128"
              />
              {errors.max_players && (
                <p className="text-destructive text-sm mt-1">{errors.max_players}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Opcional - se puede actualizar después. Mínimo 4, máximo 1000.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Crear Torneo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}