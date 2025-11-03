'use client';

import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  uploadedAt: string;
  size: number;
  type: string;
}

interface FileUploadDemoProps {
  tournamentId: string;
  tournamentName: string;
}

export function FileUploadDemo({ tournamentId, tournamentName }: FileUploadDemoProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleUploadComplete = (fileId: string, fileName: string) => {
    const newFile: UploadedFile = {
      id: fileId,
      name: fileName,
      uploadedAt: new Date().toISOString(),
      size: 0, // This would come from the server response
      type: fileName.split('.').pop()?.toLowerCase() || 'unknown',
    };

    setUploadedFiles(prev => [...prev, newFile]);
    
    // Clear any previous errors
    setUploadErrors([]);
  };

  const handleUploadError = (error: string) => {
    setUploadErrors(prev => [...prev, error]);
    console.error('Upload error:', error);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tournament Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivos de Torneo</CardTitle>
          <CardDescription>
            Sube archivos TDF para el torneo: <strong>{tournamentName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            tournamentId={tournamentId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </CardContent>
      </Card>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Errores de Subida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos Subidos</CardTitle>
            <CardDescription>
              {uploadedFiles.length} archivo{uploadedFiles.length !== 1 ? 's' : ''} subido{uploadedFiles.length !== 1 ? 's' : ''} exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Subido: {formatDate(file.uploadedAt)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {file.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div>
            <strong>Archivos soportados:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>.tdf</strong> - Archivos de torneo de Tournament Organizer Manager (TOM)</li>
              <li><strong>.xml</strong> - Archivos XML de torneo</li>
              <li><strong>.html</strong> - Reportes HTML de torneo</li>
            </ul>
          </div>
          
          <div>
            <strong>Límites:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Tamaño máximo por archivo: 10MB</li>
              <li>Puedes subir múltiples archivos a la vez</li>
              <li>Los archivos se procesan automáticamente después de la subida</li>
            </ul>
          </div>
          
          <div>
            <strong>Funcionalidades:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Arrastra y suelta archivos directamente</li>
              <li>Progreso de subida en tiempo real</li>
              <li>Validación automática de archivos</li>
              <li>Reintentar subidas fallidas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}