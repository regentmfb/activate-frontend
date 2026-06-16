import apiClient from '@/src/lib/api-client';
import type {
  DocumentUploadPayload,
  DocumentUploadResponse,
  DocumentMetadata,
} from '../types/documents.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

const http = apiClient;

export const documentsApi = {
  upload: async (payload: DocumentUploadPayload, onProgress?: (progress: number) => void): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('activateRequestId', payload.activateRequestId);
    formData.append('documentType', payload.documentType);
    
    if (payload.customerId) {
      formData.append('customerId', payload.customerId);
    }
    
    if (payload.source) {
      formData.append('source', payload.source);
    }

    const { data } = await http.post<ApiEnvelope<any>>(
      '/activate/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    
    console.log('[documentsApi] upload raw response:', data);

    // Handle both documentId and id field names
    const result = data.data;
    return {
      ...result,
      documentId: result.documentId || result.id || '',
    } as DocumentUploadResponse;
  },

  getDocuments: async (query: string | { activateRequestId?: string; identityVerificationId?: string; customerId?: string }): Promise<DocumentMetadata[]> => {
    const params = typeof query === 'string' ? { activateRequestId: query } : query;
    const { data } = await http.get<ApiEnvelope<DocumentMetadata[]>>(
      `/activate/documents`,
      { params }
    );
    return data.data;
  },

  getDocumentById: async (documentId: string): Promise<DocumentMetadata> => {
    const { data } = await http.get<ApiEnvelope<DocumentMetadata>>(
      `/activate/documents/${documentId}`
    );
    return data.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await http.delete(`/activate/documents/${documentId}`);
  },
};