'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader2,
  Calendar,
  MapPin,
  Trophy} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TDFManager } from '@/lib/tdf';
import { TournamentType } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';
import Link from 'next/link';

interface CreateTournamentFormProps {
  user: any;
}

interface TDFSummary {
  name: string;
  id: string;
  type: TournamentType;
  location: string;
  date: string;
  playerCount: number;
  isEmpty: boolean;
}

interface FormData {
  name: string;
  tournament_type: TournamentType;
  official_tournament_id: string;
  city: string;
  country: string;
  state: string;
  start_date: string;
  max_players: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  validating: boolean;
  creating: boolean;
  summary: TDFSummary | null;
  validation: { isValid: boolean; errors: string[] } | null;
  compatibility: { compatible: boolean; reason?: string } | null;
  error: string | null;
  success: boolean;
  tournamentId: string | null;
}

export function CreateTournamentForm({ user }: CreateTournamentFormProps) {
  const { tTournaments } = useTypedTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    validating: false,
    creating: false,
    summary: null,
    validation: null,
    compatibility: null,
    error: null,
    success: false,
    tournamentId: null
  });

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    tournament_type: TournamentType.TCG_PRERELEASE,
    official_tournament_id: '',
    city: '',
    country: 'España',
    state: '',
    start_date: '',
    max_players: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

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

  // Update form data from TDF summary
  const updateFormFromTDF = useCallback((summary: TDFSummary) => {
    setFormData(prev => ({
      ...prev,
      name: summary.name || prev.name,
      tournament_type: summary.type || prev.tournament_type,
      official_tournament_id: summary.id || prev.official_tournament_id,
      city: summary.location || prev.city,
      start_date: summary.date || prev.start_date,
      max_players: summary.playerCount ? summary.playerCount.toString() : prev.max_players,
    }));
  }, []);

  // TDF Upload functions
  const validateFile = useCallback(async (file: File) => {
    setUploadState(prev => ({ ...prev, validating: true, error: null }));

    try {
      if (!file.name.toLowerCase().endsWith('.tdf')) {
        throw new Error('El archivo debe tener extensión .tdf');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }

      if (file.size === 0) {
        throw new Error('El archivo está vacío');
      }

      const validation = await TDFManager.validateFile(file);
      
      if (!validation.isValid) {
        setUploadState(prev => ({
          ...prev,
          validating: false,
          validation,
          error: `Archivo TDF inválido: ${validation.errors.join(', ')}`
        }));
        return;
      }

      const compatibility = await TDFManager.checkCompatibility(file);
      
      if (!compatibility.compatible) {
        setUploadState(prev => ({
          ...prev,
          validating: false,
          compatibility,
          error: `Archivo TDF incompatible: ${compatibility.reason}`
        }));
        return;
      }

      const summary = await TDFManager.extractSummaryFromFile(file);

      setUploadState(prev => ({
        ...prev,
        validating: false,
        validation,
        compatibility,
        summary,
        error: null
      }));

      // Update form with TDF data
      updateFormFromTDF(summary);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        validating: false,
        error: error instanceof Error ? error.message : 'Error al validar el archivo'
      }));
    }
  }, [updateFormFromTDF]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadState(prev => ({ ...prev, file }));
    validateFile(file);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const tdfFile = files.find(file => file.name.toLowerCase().endsWith('.tdf'));

    if (!tdfFile) {
      setUploadState(prev => ({ ...prev, error: 'Por favor, selecciona un archivo .tdf' }));
      return;
    }

    handleFileSelect(tdfFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const removeFile = () => {
    setUploadState({
      file: null,
      uploading: false,
      validating: false,
      creating: false,
      summary: null,
      validation: null,
      compatibility: null,
      error: null,
      success: false,
      tournamentId: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Form functions
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'La fecha de inicio no puede ser en el pasado';
      }
    }


    if (formData.max_players) {
      const maxPlayers = parseInt(formData.max_players);
      if (isNaN(maxPlayers) || maxPlayers < 4) {
        newErrors.max_players = 'El número mínimo de jugadores es 4';
      } else if (maxPlayers > 1000) {
        newErrors.max_players = 'El número máximo de jugadores es 1000';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    setFormErrors({});

    try {
      const tournamentData = {
        ...formData,
        max_players: formData.max_players ? parseInt(formData.max_players) : undefined,
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
          setFormErrors({ official_tournament_id: 'Ya existe un torneo con este ID oficial' });
        } else if (result.details) {
          const serverErrors: FormErrors = {};
          result.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              serverErrors[error.path[0]] = error.message;
            }
          });
          setFormErrors(serverErrors);
        } else {
          setFormErrors({ general: result.message || 'Error al crear el torneo' });
        }
        return;
      }

      setFormSuccess(true);
      
      setTimeout(() => {
        router.push(`/tournaments/${result.tournament.id}/manage`);
      }, 2000);

    } catch (error) {
      console.error('Error creating tournament:', error);
      setFormErrors({ general: 'Error de conexión. Por favor, inténtalo de nuevo.' });
    } finally {
      setFormLoading(false);
    }
  };

  const createTournamentFromTDF = async () => {
    if (!uploadState.file || !uploadState.summary) return;

    setUploadState(prev => ({ ...prev, creating: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('tdf', uploadState.file);

      const response = await fetch('/api/tournaments/tdf-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el torneo');
      }

      setUploadState(prev => ({
        ...prev,
        creating: false,
        success: true,
        tournamentId: result.tournament.id
      }));

      setTimeout(() => {
        router.push(`/tournaments/${result.tournament.id}/manage`);
      }, 2000);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        creating: false,
        error: error instanceof Error ? error.message : 'Error al crear el torneo'
      }));
    }
  };

  // Success states
  if (uploadState.success && uploadState.tournamentId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              ¡Torneo creado exitosamente!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              El torneo se ha creado a partir del archivo TDF. Redirigiendo a la página de gestión...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (formSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              ¡Torneo creado exitosamente!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirigiendo a la página de gestión del torneo...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-6">
      <div className="space-y-8">
        {/* TDF Upload Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Archivo TDF (Opcional)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sube un archivo TDF de TOM para rellenar automáticamente los datos del torneo
            </p>
          </div>
          <div>
            {!uploadState.file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-400 transition-colors cursor-pointer bg-gray-100 dark:bg-gray-600"
                onClick={openFileDialog}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Arrastra tu archivo TDF aquí
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  O haz clic para seleccionar un archivo
                </p>
                <Button variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:border-blue-600 dark:hover:bg-blue-700">
                  Seleccionar Archivo
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Archivos soportados: .tdf (máximo 10MB)
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-100 dark:bg-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{uploadState.file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(uploadState.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".tdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Validation Status */}
        {uploadState.validating && (
          <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-gray-900 dark:text-gray-100">Validando archivo TDF...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {uploadState.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mt-2">{uploadState.error}</p>
          </div>
        )}


        {/* Manual Form Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Crear Torneo Manualmente
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Rellena los datos del torneo manualmente o edita los datos extraídos del TDF
            </p>
          </div>
          <div>
            {/* General error */}
            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{formErrors.general}</span>
                </div>
              </div>
            )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-gray-600 dark:text-gray-400">Nombre del Torneo *</Label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                      formErrors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="ej: Regional Championship Madrid 2024"
                  />
                  {formErrors.name && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tournament_type" className="text-gray-600 dark:text-gray-400">Tipo de Torneo *</Label>
                  <select
                    id="tournament_type"
                    value={formData.tournament_type}
                    onChange={(e) => handleInputChange('tournament_type', e.target.value as TournamentType)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    {tournamentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="official_tournament_id" className="text-gray-600 dark:text-gray-400">ID Oficial del Torneo *</Label>
                  <input
                    id="official_tournament_id"
                    type="text"
                    value={formData.official_tournament_id}
                    onChange={(e) => handleInputChange('official_tournament_id', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                      formErrors.official_tournament_id ? 'border-destructive/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="24-05-002583"
                  />
                  {formErrors.official_tournament_id && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.official_tournament_id}</p>
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
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder={tTournaments('createForm.descriptionPlaceholder')}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-600 dark:text-gray-400">Ciudad *</Label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                      formErrors.city ? 'border-destructive/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={tTournaments('createForm.cityPlaceholder')}
                  />
                  {formErrors.city && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state" className="text-gray-600 dark:text-gray-400">Estado/Provincia</Label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    placeholder={tTournaments('createForm.statePlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-gray-600 dark:text-gray-400">País *</Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date and Participants */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fecha y Participantes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-gray-600 dark:text-gray-400">Fecha y Hora de Inicio *</Label>
                  <input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                      formErrors.start_date ? 'border-destructive/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.start_date && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="max_players" className="text-gray-600 dark:text-gray-400">Número Máximo de Jugadores</Label>
                  <input
                    id="max_players"
                    type="number"
                    min="4"
                    max="1000"
                    value={formData.max_players}
                    onChange={(e) => handleInputChange('max_players', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                      formErrors.max_players ? 'border-destructive/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="128"
                  />
                  {formErrors.max_players && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.max_players}</p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Opcional - se puede actualizar después. Mínimo 4, máximo 1000.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-300 dark:border-gray-600">
              <Link href="/dashboard">
                <Button type="button" variant="outline" className="bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20">
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={formLoading}
                className="flex items-center gap-2 text-white"
              >
                {formLoading ? (
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
        </div>
      </div>
    </div>
  );
}
