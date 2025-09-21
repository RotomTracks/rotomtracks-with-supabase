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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TDFManager } from '@/lib/tdf';

interface TDFUploadProps {
  onTournamentCreated?: (tournamentId: string) => void;
  className?: string;
}

interface TDFSummary {
  name: string;
  id: string;
  type: string;
  location: string;
  date: string;
  playerCount: number;
  isEmpty: boolean;
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

export function TDFUpload({ onTournamentCreated, className = '' }: TDFUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<UploadState>({
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

  const resetState = () => {
    setState({
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
  };

  const validateFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, validating: true, error: null }));

    try {
      // Basic file validation
      if (!file.name.toLowerCase().endsWith('.tdf')) {
        throw new Error('El archivo debe tener extensión .tdf');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }

      if (file.size === 0) {
        throw new Error('El archivo está vacío');
      }

      // Validate TDF structure
      const validation = await TDFManager.validateFile(file);
      
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          validating: false,
          validation,
          error: `Archivo TDF inválido: ${validation.errors.join(', ')}`
        }));
        return;
      }

      // Check compatibility
      const compatibility = await TDFManager.checkCompatibility(file);
      
      if (!compatibility.compatible) {
        setState(prev => ({
          ...prev,
          validating: false,
          compatibility,
          error: `Archivo TDF incompatible: ${compatibility.reason}`
        }));
        return;
      }

      // Extract summary
      const summary = await TDFManager.extractSummaryFromFile(file);

      setState(prev => ({
        ...prev,
        validating: false,
        validation,
        compatibility,
        summary,
        error: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        validating: false,
        error: error instanceof Error ? error.message : 'Error al validar el archivo'
      }));
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setState(prev => ({ ...prev, file }));
    validateFile(file);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const tdfFile = files.find(file => file.name.toLowerCase().endsWith('.tdf'));

    if (!tdfFile) {
      setState(prev => ({ ...prev, error: 'Por favor, selecciona un archivo .tdf' }));
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

  const createTournamentFromTDF = async () => {
    if (!state.file || !state.summary) return;

    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('tdf', state.file);

      const response = await fetch('/api/tournaments/tdf-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el torneo');
      }

      setState(prev => ({
        ...prev,
        creating: false,
        success: true,
        tournamentId: result.tournament.id
      }));

      if (onTournamentCreated) {
        onTournamentCreated(result.tournament.id);
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/tournaments/${result.tournament.id}/manage`);
      }, 2000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        creating: false,
        error: error instanceof Error ? error.message : 'Error al crear el torneo'
      }));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (state.success && state.tournamentId) {
    return (
      <Card className={`max-w-2xl mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Torneo creado exitosamente!
            </h3>
            <p className="text-gray-600 mb-4">
              El torneo se ha creado a partir del archivo TDF. Redirigiendo a la página de gestión...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Archivo TDF
          </CardTitle>
          <CardDescription>
            Sube un archivo TDF de TOM para crear un torneo automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!state.file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={openFileDialog}
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arrastra tu archivo TDF aquí
              </h3>
              <p className="text-gray-600 mb-4">
                O haz clic para seleccionar un archivo
              </p>
              <Button variant="outline">
                Seleccionar Archivo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Archivos soportados: .tdf (máximo 10MB)
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{state.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(state.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-500 hover:text-red-500"
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
        </CardContent>
      </Card>

      {/* Validation Status */}
      {state.validating && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-gray-700">Validando archivo TDF...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-2">{state.error}</p>
          </CardContent>
        </Card>
      )}

      {/* TDF Summary */}
      {state.summary && state.validation?.isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Información del Torneo
            </CardTitle>
            <CardDescription>
              Datos extraídos del archivo TDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900">{state.summary.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ID Oficial</label>
                <p className="text-gray-900">{state.summary.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <p className="text-gray-900">{state.summary.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Ubicación</label>
                <p className="text-gray-900">{state.summary.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha</label>
                <p className="text-gray-900">{state.summary.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Jugadores</label>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{state.summary.playerCount}</p>
                  {state.summary.isEmpty ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Vacío - Listo para registro
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Con jugadores
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {state.summary.isEmpty && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Perfecto para registro online</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Este archivo TDF está vacío, ideal para que los jugadores se registren online.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={removeFile}>
                Cancelar
              </Button>
              <Button 
                onClick={createTournamentFromTDF}
                disabled={state.creating}
                className="flex items-center gap-2"
              >
                {state.creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando Torneo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Crear Torneo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}