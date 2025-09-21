'use client';

import { useState, useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Upload,
  Plus,
  ArrowRight
} from 'lucide-react';
import { TournamentMatcher, type MatchResult } from '@/lib/utils/tournament-matcher';

interface SmartFileUploadProps {
  userId: string;
  onTournamentCreated?: (tournamentId: string) => void;
  onTournamentUpdated?: (tournamentId: string) => void;
}

export function SmartFileUpload({ 
  userId, 
  onTournamentCreated, 
  onTournamentUpdated 
}: SmartFileUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MatchResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analizar archivo cuando se selecciona
  const handleFileSelected = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    setError(null);
    setIsAnalyzing(true);
    
    try {
      const fileContent = await file.text();
      const result = await TournamentMatcher.matchFile(fileContent, userId);
      setAnalysisResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al analizar archivo');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [userId]);

  // Crear nuevo torneo
  const handleCreateNew = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', 'create_new');
      
      const response = await fetch('/api/tournaments/smart-upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        onTournamentCreated?.(result.tournamentId);
        setAnalysisResult(null);
        setSelectedFile(null);
      } else {
        setError(result.message || 'Error al crear torneo');
      }
    } catch (error) {
      setError('Error al crear torneo');
    }
  }, [selectedFile, onTournamentCreated]);

  // Actualizar torneo existente
  const handleUpdateExisting = useCallback(async (tournamentId: string) => {
    if (!selectedFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', 'update_existing');
      formData.append('tournamentId', tournamentId);
      
      const response = await fetch('/api/tournaments/smart-upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        onTournamentUpdated?.(tournamentId);
        setAnalysisResult(null);
        setSelectedFile(null);
      } else {
        setError(result.message || 'Error al actualizar torneo');
      }
    } catch {
      setError('Error al actualizar torneo');
    }
  }, [selectedFile, onTournamentUpdated]);

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Smart Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Subida Inteligente de Archivos</span>
          </CardTitle>
          <CardDescription>
            Detecta automáticamente si el archivo corresponde a un torneo existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('smart-file-input')?.click()}
          >
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Selecciona un archivo TDF para análisis inteligente
              </p>
              <p className="text-sm text-gray-500">
                El sistema detectará automáticamente si corresponde a un torneo existente
              </p>
            </div>
            
            <input
              id="smart-file-input"
              type="file"
              accept=".tdf,.xml"
              onChange={(e) => handleFileSelected(e.target.files)}
              className="hidden"
            />
          </div>
          
          {isAnalyzing && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Analizando archivo...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisResult && selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado del Análisis</CardTitle>
            <CardDescription>
              Archivo: <strong>{selectedFile.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Recomendaciones:</h4>
              <ul className="space-y-1">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Match */}
            {analysisResult.bestMatch && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Mejor Coincidencia</h4>
                  <Badge 
                    variant={analysisResult.bestMatch.confidence >= 0.7 ? "default" : "secondary"}
                    className={getConfidenceColor(analysisResult.bestMatch.confidence)}
                  >
                    {formatConfidence(analysisResult.bestMatch.confidence)} confianza
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">{analysisResult.bestMatch.existingTournament.name}</p>
                  <p className="text-sm text-gray-600">
                    {analysisResult.bestMatch.existingTournament.city}, {analysisResult.bestMatch.existingTournament.country}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {analysisResult.bestMatch.existingTournament.official_tournament_id}
                  </p>
                  
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Razones:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {analysisResult.bestMatch.reasons.map((reason, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Other Matches */}
            {analysisResult.matches.length > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Otras Coincidencias</h4>
                <div className="space-y-2">
                  {analysisResult.matches.slice(1, 3).map((match, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{match.existingTournament.name}</span>
                        <Badge variant="outline">
                          {formatConfidence(match.confidence)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        {match.reasons.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4 border-t">
              {analysisResult.shouldCreateNew ? (
                <Button onClick={handleCreateNew} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Torneo
                </Button>
              ) : (
                <Button 
                  onClick={() => handleUpdateExisting(analysisResult.bestMatch!.tournamentId)}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Actualizar Torneo Existente
                </Button>
              )}
              
              {analysisResult.bestMatch && analysisResult.shouldCreateNew && (
                <Button 
                  variant="outline"
                  onClick={() => handleUpdateExisting(analysisResult.bestMatch!.tournamentId)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Actualizar &quot;{analysisResult.bestMatch.existingTournament.name}&quot;
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}