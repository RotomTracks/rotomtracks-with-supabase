'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  RefreshCw, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';

interface WatchedFile {
  path: string;
  name: string;
  lastModified: number;
  size: number;
  tournamentId?: string;
  status: 'watching' | 'uploading' | 'uploaded' | 'error';
  lastUpload?: number;
  autoUpload: boolean;
}

interface FileWatcherProps {
  tournamentId: string;
  onFileUpload: (file: File) => void;
}

export function FileWatcher({ tournamentId, onFileUpload }: FileWatcherProps) {
  const [watchedFiles, setWatchedFiles] = useState<WatchedFile[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [watchInterval, setWatchInterval] = useState(5000); // 5 seconds default

  // Check if File System Access API is supported
  const isFileSystemAccessSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // Load watched files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`tournament-watcher-${tournamentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWatchedFiles(parsed);
      } catch (error) {
        console.error('Error loading watched files:', error);
      }
    }
  }, [tournamentId]);

  // Save watched files to localStorage
  const saveWatchedFiles = useCallback((files: WatchedFile[]) => {
    localStorage.setItem(`tournament-watcher-${tournamentId}`, JSON.stringify(files));
  }, [tournamentId]);

  // Add file to watch list
  const addFileToWatch = useCallback(async () => {
    if (!isFileSystemAccessSupported) {
      alert('Tu navegador no soporta la API de acceso a archivos. Usa Chrome/Edge 86+ o Firefox con flags habilitados.');
      return;
    }

    try {
      // @ts-ignore - File System Access API
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Tournament files',
            accept: {
              'application/xml': ['.tdf', '.xml'],
              'text/xml': ['.tdf', '.xml'],
            },
          },
        ],
        multiple: false,
      });

      const file = await fileHandle.getFile();
      
      // Check if file is already being watched
      const existingIndex = watchedFiles.findIndex(wf => wf.name === file.name);
      
      const watchedFile: WatchedFile = {
        path: fileHandle.name, // This is limited in browsers for security
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        tournamentId,
        status: 'watching',
        autoUpload: true,
      };

      let newFiles: WatchedFile[];
      if (existingIndex >= 0) {
        // Update existing file
        newFiles = [...watchedFiles];
        newFiles[existingIndex] = watchedFile;
      } else {
        // Add new file
        newFiles = [...watchedFiles, watchedFile];
      }

      setWatchedFiles(newFiles);
      saveWatchedFiles(newFiles);

      // Store file handle for future access (limited browser support)
      // @ts-ignore
      watchedFile._fileHandle = fileHandle;

    } catch (error) {
      console.error('Error adding file to watch:', error);
    }
  }, [watchedFiles, tournamentId, saveWatchedFiles, isFileSystemAccessSupported]);

  // Check for file changes
  const checkFileChanges = useCallback(async () => {
    const updatedFiles = [...watchedFiles];
    let hasChanges = false;

    for (let i = 0; i < updatedFiles.length; i++) {
      const watchedFile = updatedFiles[i];
      
      try {
        // @ts-ignore
        if (watchedFile._fileHandle) {
          // @ts-ignore
          const file = await watchedFile._fileHandle.getFile();
          
          // Check if file has been modified
          if (file.lastModified > watchedFile.lastModified) {
            updatedFiles[i] = {
              ...watchedFile,
              lastModified: file.lastModified,
              size: file.size,
              status: watchedFile.autoUpload ? 'uploading' : 'watching',
            };
            
            hasChanges = true;
            
            // Auto-upload if enabled
            if (watchedFile.autoUpload) {
              try {
                onFileUpload(file);
                updatedFiles[i].status = 'uploaded';
                updatedFiles[i].lastUpload = Date.now();
              } catch (error) {
                updatedFiles[i].status = 'error';
                console.error('Auto-upload failed:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error checking file ${watchedFile.name}:`, error);
        updatedFiles[i].status = 'error';
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setWatchedFiles(updatedFiles);
      saveWatchedFiles(updatedFiles);
    }
  }, [watchedFiles, onFileUpload, saveWatchedFiles]);

  // Start/stop watching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWatching && watchedFiles.length > 0) {
      interval = setInterval(checkFileChanges, watchInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWatching, watchedFiles.length, checkFileChanges, watchInterval]);

  // Toggle auto-upload for a file
  const toggleAutoUpload = useCallback((index: number) => {
    const newFiles = [...watchedFiles];
    newFiles[index].autoUpload = !newFiles[index].autoUpload;
    setWatchedFiles(newFiles);
    saveWatchedFiles(newFiles);
  }, [watchedFiles, saveWatchedFiles]);

  // Remove file from watch list
  const removeFile = useCallback((index: number) => {
    const newFiles = watchedFiles.filter((_, i) => i !== index);
    setWatchedFiles(newFiles);
    saveWatchedFiles(newFiles);
  }, [watchedFiles, saveWatchedFiles]);

  // Manual upload
  const manualUpload = useCallback(async (index: number) => {
    const watchedFile = watchedFiles[index];
    
    try {
      // @ts-ignore
      if (watchedFile._fileHandle) {
        // @ts-ignore
        const file = await watchedFile._fileHandle.getFile();
        
        const newFiles = [...watchedFiles];
        newFiles[index].status = 'uploading';
        setWatchedFiles(newFiles);
        
        onFileUpload(file);
        
        newFiles[index].status = 'uploaded';
        newFiles[index].lastUpload = Date.now();
        setWatchedFiles(newFiles);
        saveWatchedFiles(newFiles);
      }
    } catch (error) {
      const newFiles = [...watchedFiles];
      newFiles[index].status = 'error';
      setWatchedFiles(newFiles);
      saveWatchedFiles(newFiles);
      console.error('Manual upload failed:', error);
    }
  }, [watchedFiles, onFileUpload, saveWatchedFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isFileSystemAccessSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoreo de Archivos</CardTitle>
          <CardDescription>
            Detecta automáticamente cambios en archivos TDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tu navegador no soporta la API de acceso a archivos necesaria para esta funcionalidad.
              Usa Chrome/Edge 86+ para acceder a esta característica.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Monitoreo de Archivos</span>
          </CardTitle>
          <CardDescription>
            Detecta automáticamente cambios en archivos TDF y los sube automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={addFileToWatch} variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </Button>
              
              <Button
                onClick={() => setIsWatching(!isWatching)}
                variant={isWatching ? "destructive" : "default"}
              >
                {isWatching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Detener Monitoreo
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Iniciar Monitoreo
                  </>
                )}
              </Button>
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <select
                value={watchInterval}
                onChange={(e) => setWatchInterval(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={1000}>1 segundo</option>
                <option value={5000}>5 segundos</option>
                <option value={10000}>10 segundos</option>
                <option value={30000}>30 segundos</option>
                <option value={60000}>1 minuto</option>
              </select>
            </div>
          </div>

          {/* Status */}
          {isWatching && watchedFiles.length > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Monitoreando {watchedFiles.length} archivo{watchedFiles.length !== 1 ? 's' : ''} 
                cada {watchInterval / 1000} segundo{watchInterval !== 1000 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Watched Files List */}
      {watchedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos Monitoreados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {watchedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>Modificado: {formatDate(file.lastModified)}</span>
                        {file.lastUpload && (
                          <>
                            <span>•</span>
                            <span>Subido: {formatDate(file.lastUpload)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <Badge
                      variant={
                        file.status === 'uploaded' ? 'default' :
                        file.status === 'error' ? 'destructive' :
                        file.status === 'uploading' ? 'secondary' : 'outline'
                      }
                    >
                      {file.status === 'watching' && <Eye className="h-3 w-3 mr-1" />}
                      {file.status === 'uploading' && <Upload className="h-3 w-3 mr-1" />}
                      {file.status === 'uploaded' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {file.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {file.status}
                    </Badge>

                    {/* Auto-upload Toggle */}
                    <Button
                      size="sm"
                      variant={file.autoUpload ? "default" : "outline"}
                      onClick={() => toggleAutoUpload(index)}
                    >
                      Auto
                    </Button>

                    {/* Manual Upload */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => manualUpload(index)}
                      disabled={file.status === 'uploading'}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>

                    {/* Remove */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}