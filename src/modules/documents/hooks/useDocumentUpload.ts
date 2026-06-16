'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appToast } from '@/src/lib/toast';
import { documentsApi } from '../api/documents.api';
import { validateFile, createFilePreview } from '../utils/file-validation';
import type {
  DocumentUploadPayload,
  FileUploadState,
  FileValidationOptions,
  DocumentType,
  DocumentSource,
} from '../types/documents.types';

export const DOCUMENTS_QUERY_KEYS = {
  documents: (activateRequestId: string) => ['documents', activateRequestId] as const,
  documentById: (id: string) => ['documents', 'detail', id] as const,
};

type UseDocumentUploadOptions = {
  activateRequestId: string;
  customerId?: string;
  documentType: DocumentType;
  source?: DocumentSource;
  validationOptions?: FileValidationOptions;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
};

export function useDocumentUpload(options: UseDocumentUploadOptions) {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    status: 'idle',
    progress: 0,
  });

  const uploadMutation = useMutation({
    mutationFn: async (payload: DocumentUploadPayload) => {
      return documentsApi.upload(payload, (progress) => {
        setUploadState(prev => ({ ...prev, progress }));
      });
    },
    onMutate: () => {
      setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0, error: undefined }));
    },
    onSuccess: (result) => {
      setUploadState(prev => ({ 
        ...prev, 
        status: 'success', 
        progress: 100, 
        result 
      }));
      
      // Invalidate documents query
      queryClient.invalidateQueries({ 
        queryKey: DOCUMENTS_QUERY_KEYS.documents(options.activateRequestId) 
      });
      
      appToast.documentUploaded();
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      setUploadState(prev => ({ 
        ...prev, 
        status: 'error', 
        progress: 0, 
        error: error.message 
      }));
      
      appToast.documentError(error.message || 'Failed to upload document');
      options.onError?.(error);
    },
  });

  const selectFile = useCallback(async (file: File) => {
    // Validate file
    const validation = validateFile(file, options.validationOptions);
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      setUploadState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage 
      }));
      appToast.documentError(errorMessage);
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    try {
      if (file.type.startsWith('image/')) {
        preview = await createFilePreview(file);
      }
    } catch (error) {
      // Preview creation failed, but continue with upload
      console.warn('Failed to create file preview:', error);
    }

    setUploadState({
      file,
      preview,
      status: 'idle',
      progress: 0,
      error: undefined,
    });
  }, [options.validationOptions]);

  const uploadFile = useCallback(() => {
    if (!uploadState.file) {
      appToast.documentError('No file selected');
      return;
    }

    const payload: DocumentUploadPayload = {
      file: uploadState.file,
      activateRequestId: options.activateRequestId,
      customerId: options.customerId,
      documentType: options.documentType,
      source: options.source,
    };

    uploadMutation.mutate(payload);
  }, [uploadState.file, options, uploadMutation]);

  const clearFile = useCallback(() => {
    setUploadState({
      file: null,
      status: 'idle',
      progress: 0,
      error: undefined,
      preview: undefined,
      result: undefined,
    });
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      error: undefined,
      result: undefined,
    }));
  }, []);

  return {
    uploadState,
    selectFile,
    uploadFile,
    clearFile,
    resetUpload,
    isUploading: uploadMutation.isPending,
    isSuccess: uploadState.status === 'success',
    isError: uploadState.status === 'error',
  };
}