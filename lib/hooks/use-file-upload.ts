'use client';

import { useState, useCallback } from 'react';

export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadPath: string;
  };
}

interface UseFileUploadOptions {
  tournamentId: string;
  onUploadComplete?: (fileId: string, fileName: string, result: UploadFile['result']) => void;
  onUploadError?: (error: string, file: UploadFile) => void;
  onUploadProgress?: (progress: number, file: UploadFile) => void;
  maxConcurrentUploads?: number;
}

export function useFileUpload({
  tournamentId,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  maxConcurrentUploads = 3,
}: UseFileUploadOptions) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
    
    // Start uploading files (respecting concurrent limit)
    uploadFiles.forEach(uploadFile => {
      if (activeUploads.size < maxConcurrentUploads) {
        startUpload(uploadFile);
      }
    });

    return uploadFiles;
  }, [activeUploads.size, maxConcurrentUploads]);

  // Start uploading a file
  const startUpload = useCallback(async (uploadFile: UploadFile) => {
    if (activeUploads.has(uploadFile.id)) return;

    setActiveUploads(prev => new Set([...prev, uploadFile.id]));
    
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading' as const }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('tournamentId', tournamentId);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          ));

          onUploadProgress?.(progress, uploadFile);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        setActiveUploads(prev => {
          const newSet = new Set(prev);
          newSet.delete(uploadFile.id);
          return newSet;
        });

        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            const result = {
              fileId: response.fileId,
              fileName: response.fileName,
              fileSize: response.fileSize,
              fileType: response.fileType,
              uploadPath: response.uploadPath,
            };

            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    status: 'completed' as const, 
                    progress: 100,
                    result 
                  }
                : f
            ));

            onUploadComplete?.(response.fileId, response.fileName, result);
            
            // Start next upload if there are pending files
            startNextUpload();
            
          } catch (error) {
            handleUploadError(uploadFile, 'Invalid server response');
          }
        } else {
          let errorMessage = `Upload failed with status ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch {
            // Use default error message
          }
          handleUploadError(uploadFile, errorMessage);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        handleUploadError(uploadFile, 'Network error during upload');
      });

      xhr.addEventListener('abort', () => {
        handleUploadError(uploadFile, 'Upload was cancelled');
      });

      // Start upload
      xhr.open('POST', `/api/tournaments/${tournamentId}/upload`);
      xhr.send(formData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleUploadError(uploadFile, errorMessage);
    }
  }, [tournamentId, activeUploads, onUploadComplete, onUploadProgress]);

  // Handle upload errors
  const handleUploadError = useCallback((uploadFile: UploadFile, errorMessage: string) => {
    setActiveUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(uploadFile.id);
      return newSet;
    });

    const updatedFile = {
      ...uploadFile,
      status: 'error' as const,
      error: errorMessage,
    };

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? updatedFile : f
    ));

    onUploadError?.(errorMessage, updatedFile);
    
    // Start next upload if there are pending files
    startNextUpload();
  }, [onUploadError]);

  // Start next pending upload
  const startNextUpload = useCallback(() => {
    if (activeUploads.size >= maxConcurrentUploads) return;

    const pendingFile = files.find(f => f.status === 'pending');
    if (pendingFile) {
      startUpload(pendingFile);
    }
  }, [files, activeUploads.size, maxConcurrentUploads, startUpload]);

  // Retry failed upload
  const retryUpload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.status === 'error') {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending' as const, error: undefined, progress: 0 }
          : f
      ));
      
      if (activeUploads.size < maxConcurrentUploads) {
        startUpload(file);
      }
    }
  }, [files, activeUploads.size, maxConcurrentUploads, startUpload]);

  // Remove file from list
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Remove from active uploads if it was uploading
    setActiveUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    
    // Start next upload if there are pending files
    setTimeout(startNextUpload, 0);
  }, [startNextUpload]);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setActiveUploads(new Set());
  }, []);

  // Get upload statistics
  const getStats = useCallback(() => {
    const total = files.length;
    const completed = files.filter(f => f.status === 'completed').length;
    const failed = files.filter(f => f.status === 'error').length;
    const uploading = files.filter(f => f.status === 'uploading').length;
    const pending = files.filter(f => f.status === 'pending').length;

    return {
      total,
      completed,
      failed,
      uploading,
      pending,
      isComplete: total > 0 && completed === total,
      hasErrors: failed > 0,
      isUploading: uploading > 0 || pending > 0,
    };
  }, [files]);

  return {
    files,
    addFiles,
    retryUpload,
    removeFile,
    clearFiles,
    stats: getStats(),
  };
}