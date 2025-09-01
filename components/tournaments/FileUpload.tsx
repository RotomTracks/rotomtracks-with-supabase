'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/use-file-upload';
import { FILE_UPLOAD_CONFIG } from '@/lib/constants/tournament';

interface FileUploadProps {
  tournamentId: string;
  onUploadComplete: (fileId: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  disabled?: boolean;
  multiple?: boolean;
}

export function FileUpload({
  tournamentId,
  onUploadComplete,
  onUploadError,
  acceptedTypes = [...FILE_UPLOAD_CONFIG.allowedExtensions],
  maxSize = FILE_UPLOAD_CONFIG.maxSize,
  disabled = false,
  multiple = true,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { files, addFiles, retryUpload, removeFile, clearFiles, stats } = useFileUpload({
    tournamentId,
    onUploadComplete: (fileId, fileName, result) => {
      onUploadComplete(fileId, fileName);
    },
    onUploadError: (error, file) => {
      onUploadError?.(error);
    },
  });

  // Validate file before upload
  const validateFile = useCallback((file: File): string | null => {
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `Tipo de archivo no válido. Solo se permiten: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
    }

    // Check if it's a TDF file (basic validation)
    if (extension === '.tdf' && !file.type.includes('xml') && file.type !== 'application/octet-stream') {
      return 'El archivo TDF debe ser un archivo XML válido';
    }

    return null;
  }, [acceptedTypes, maxSize]);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show validation errors
    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    // Add valid files to upload queue
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, [validateFile, disabled, addFiles, onUploadError]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect, disabled]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragOver 
              ? 'Suelta los archivos aquí' 
              : 'Arrastra archivos TDF aquí o haz clic para seleccionar'
            }
          </p>
          <p className="text-sm text-gray-500">
            Archivos soportados: {acceptedTypes.join(', ')} 
            (máximo {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Upload Statistics */}
      {stats.total > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              {stats.completed}/{stats.total} completados
            </span>
            {stats.failed > 0 && (
              <span className="text-red-600">
                {stats.failed} fallidos
              </span>
            )}
            {stats.uploading > 0 && (
              <span className="text-blue-600 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                {stats.uploading} subiendo
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={clearFiles}
            disabled={stats.isUploading}
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Archivos</h4>
          
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                
                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={uploadFile.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadFile.progress}% completado
                    </p>
                  </div>
                )}
                
                {/* Error Message */}
                {uploadFile.status === 'error' && uploadFile.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {uploadFile.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Status Icon */}
              <div className="flex items-center space-x-2">
                {uploadFile.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                
                {uploadFile.status === 'error' && (
                  <div className="flex space-x-1">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(uploadFile.id)}
                      className="text-xs"
                    >
                      Reintentar
                    </Button>
                  </div>
                )}
                
                {uploadFile.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                
                {uploadFile.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full bg-gray-300" />
                )}
                
                {/* Remove Button */}
                {uploadFile.status !== 'uploading' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(uploadFile.id)}
                    className="p-1 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {stats.isUploading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Subiendo archivos... Por favor no cierres esta página.
          </AlertDescription>
        </Alert>
      )}

      {stats.hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Algunos archivos no se pudieron subir. Revisa los errores arriba.
          </AlertDescription>
        </Alert>
      )}

      {stats.isComplete && stats.total > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Todos los archivos se han subido exitosamente!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}