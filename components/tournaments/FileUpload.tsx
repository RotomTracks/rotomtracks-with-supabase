'use client';

// React
import { useCallback, useRef, useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Hooks
import { useFileUpload } from '@/lib/hooks/use-file-upload';

// Constants
import { FILE_UPLOAD_CONFIG } from '@/lib/constants/tournament';

// Types
import { UserRole, LoadingState } from '@/lib/types/tournament';

// Utilities
import { useFormatting } from '@/lib/i18n';

interface FileUploadProps {
  tournamentId: string;
  onUploadComplete: (fileId: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  disabled?: boolean;
  multiple?: boolean;
  userRole?: UserRole;
  loading?: boolean;
}

export function FileUpload({
  tournamentId,
  onUploadComplete,
  onUploadError,
  acceptedTypes = [...FILE_UPLOAD_CONFIG.allowedExtensions],
  maxSize = FILE_UPLOAD_CONFIG.maxSize,
  disabled = false,
  multiple = true,
  userRole = UserRole.ORGANIZER,
  loading = false,
}: FileUploadProps) {
  // Hooks
  const { formatFileSize } = useFormatting();
  
  // State
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { files, addFiles, retryUpload, removeFile, clearFiles } = useFileUpload({
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

  // Render loading state
  const renderLoadingState = () => (
    <div className="space-y-4" role="status" aria-label="Cargando subida de archivos">
      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
        </div>
      </div>
      <span className="sr-only">Cargando subida de archivos...</span>
    </div>
  );

  if (loading) return renderLoadingState();

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !loading && fileInputRef.current?.click()}
        role="button"
        aria-label="Área de subida de archivos"
        tabIndex={disabled || loading ? -1 : 0}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isDragOver 
              ? 'Suelta los archivos aquí' 
              : 'Arrastra archivos TDF aquí o haz clic para seleccionar'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
          disabled={disabled || loading}
        />
      </div>

      {/* Upload Statistics */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {files.filter(f => f.status === 'completed').length}/{files.length} completados
            </span>
            {files.filter(f => f.status === 'error').length > 0 && (
              <span className="text-red-600">
                {files.filter(f => f.status === 'error').length} fallidos
              </span>
            )}
            {files.filter(f => f.status === 'uploading').length > 0 && (
              <span className="text-blue-600 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                {files.filter(f => f.status === 'uploading').length} subiendo
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={clearFiles}
            disabled={files.some(f => f.status === 'uploading')}
            aria-label="Limpiar todos los archivos"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Lista de archivos">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Archivos</h4>
          
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              role="listitem"
            >
              <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(uploadFile.file.size)}
                </p>
                
                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={uploadFile.progress} className="h-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                      aria-label={`Reintentar subida de ${uploadFile.file.name}`}
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
                    aria-label={`Eliminar ${uploadFile.file.name}`}
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
      {files.some(f => f.status === 'uploading') && (
        <Alert role="status">
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Subiendo archivos... Por favor no cierres esta página.
          </AlertDescription>
        </Alert>
      )}

      {files.some(f => f.status === 'error') && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Algunos archivos no se pudieron subir. Revisa los errores arriba.
          </AlertDescription>
        </Alert>
      )}

      {files.length > 0 && files.every(f => f.status === 'completed') && (
        <Alert role="status">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Todos los archivos se han subido exitosamente!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}