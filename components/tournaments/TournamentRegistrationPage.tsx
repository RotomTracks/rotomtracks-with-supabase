'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Trophy,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import RealTimePlayerCount from './RealTimePlayerCount';

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
  description?: string;
  organizer: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
  };
}

interface TournamentRegistrationPageProps {
  tournament: Tournament;
}

interface RegistrationForm {
  firstName: string;
  lastName: string;
  birthdate: string;
  playerId: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function TournamentRegistrationPage({ tournament }: TournamentRegistrationPageProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<RegistrationForm>({
    firstName: '',
    lastName: '',
    birthdate: '',
    playerId: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    acceptTerms: false
  });

  const handleInputChange = (field: keyof RegistrationForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        newErrors.birthdate = 'La fecha de nacimiento no puede ser futura';
      } else if (age > 100) {
        newErrors.birthdate = 'Por favor, verifica la fecha de nacimiento';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    // Player ID validation (optional but if provided, should be valid)
    if (formData.playerId && !/^\d{7,10}$/.test(formData.playerId.replace(/\D/g, ''))) {
      newErrors.playerId = 'El ID de jugador debe tener entre 7 y 10 dígitos';
    }

    // Emergency contact for minors
    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      if (!formData.emergencyContact.trim()) {
        newErrors.emergencyContact = 'El contacto de emergencia es obligatorio para menores de edad';
      }
      if (!formData.emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'El teléfono de emergencia es obligatorio para menores de edad';
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
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
      const registrationData = {
        tournament_id: tournament.id,
        player_name: `${formData.firstName} ${formData.lastName}`.trim(),
        player_id: formData.playerId, // Required field
        player_birthdate: formData.birthdate,
        email: formData.email,
        phone: formData.phone,
        emergency_contact: formData.emergencyContact || null,
        emergency_phone: formData.emergencyPhone || null,
        registration_source: 'web'
      };

      const response = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'Tournament is full') {
          setErrors({ general: 'El torneo está completo. Te hemos añadido a la lista de espera.' });
        } else if (result.error === 'Player already registered') {
          setErrors({ general: 'Ya estás registrado en este torneo.' });
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
          setErrors({ general: result.message || 'Error al registrarse en el torneo' });
        }
        return;
      }

      setSuccess(true);

    } catch (error) {
      console.error('Error registering for tournament:', error);
      setErrors({ general: 'Error de conexión. Por favor, inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Registro completado!
                </h3>
                <p className="text-gray-600 mb-6">
                  Te has registrado exitosamente en {tournament.name}. 
                  Recibirás un email de confirmación en breve.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Button variant="outline">
                      Ver Torneo
                    </Button>
                  </Link>
                  <Link href="/tournaments">
                    <Button>
                      Ver Más Torneos
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/tournaments/${tournament.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Volver al Torneo
            </Button>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Registro para {tournament.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(tournament.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{tournament.city}, {tournament.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{tournament.tournament_type}</span>
                  </div>
                </div>
                
                <RealTimePlayerCount 
                  tournamentId={tournament.id}
                  initialCount={tournament.current_players}
                  initialMax={tournament.max_players}
                  initialRegistrationOpen={tournament.registration_open}
                  initialStatus={tournament.status}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Formulario de Registro
                </CardTitle>
                <CardDescription>
                  Completa todos los campos para registrarte en el torneo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{errors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre *</Label>
                        <input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Tu nombre"
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName">Apellidos *</Label>
                        <input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Tus apellidos"
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birthdate">Fecha de Nacimiento *</Label>
                        <input
                          id="birthdate"
                          type="date"
                          value={formData.birthdate}
                          onChange={(e) => handleInputChange('birthdate', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.birthdate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.birthdate && (
                          <p className="text-red-600 text-sm mt-1">{errors.birthdate}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="playerId">ID de Jugador</Label>
                        <input
                          id="playerId"
                          type="text"
                          value={formData.playerId}
                          onChange={(e) => handleInputChange('playerId', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.playerId ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="1234567890"
                        />
                        {errors.playerId && (
                          <p className="text-red-600 text-sm mt-1">{errors.playerId}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                          Opcional - Tu ID oficial de jugador de Pokémon
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="tu@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Teléfono *</Label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+34 600 000 000"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact (for minors) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contacto de Emergencia</h3>
                    <p className="text-sm text-gray-600">
                      Obligatorio para menores de 18 años
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContact">Nombre del Contacto</Label>
                        <input
                          id="emergencyContact"
                          type="text"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Nombre del padre/madre/tutor"
                        />
                        {errors.emergencyContact && (
                          <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                        <input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.emergencyPhone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+34 600 000 000"
                        />
                        {errors.emergencyPhone && (
                          <p className="text-red-600 text-sm mt-1">{errors.emergencyPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="acceptTerms" className="text-sm">
                          Acepto los términos y condiciones del torneo *
                        </Label>
                        {errors.acceptTerms && (
                          <p className="text-red-600 text-sm mt-1">{errors.acceptTerms}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Link href={`/tournaments/${tournament.id}`}>
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
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Registrarse
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Torneo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Organizador</label>
                  <p className="text-gray-900">
                    {tournament.organizer.organization_name || 
                     `${tournament.organizer.first_name} ${tournament.organizer.last_name}`.trim() ||
                     'Organizador del torneo'}
                  </p>
                </div>
                
                {tournament.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descripción</label>
                    <p className="text-gray-900 text-sm">{tournament.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Estado del Registro</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 font-medium">Abierto</span>
                  </div>
                </div>

                {tournament.max_players && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capacidad</label>
                    <div className="mt-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{tournament.current_players} registrados</span>
                        <span>{tournament.max_players} máximo</span>
                      </div>
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>¿Necesitas Ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Si tienes problemas con el registro o preguntas sobre el torneo, 
                  puedes contactar con el organizador.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contactar Organizador
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}