'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { IdentroLiveness } from 'identro-liveness-react';
import apiClient from '@src/lib/api-client';

export type IdentroRequestParams = {
  serviceType: 'FACE_LIVENESS_ONLY' | 'FACE_LIVENESS_BVN' | 'FACE_LIVENESS_NIN' | 'FACE_LIVENESS_REFERENCE';
  sourceType: 'UPLOADED_REFERENCE' | 'BVN' | 'NIN';
  bvn?: string;
  nin?: string;
  referenceFaceBase64?: string;
  consentCaptured: boolean;
  consentReference: string;
  idempotencyKey: string;
};

type IdentroContextType = {
  /**
   * Starts an Identro liveness session. Returns a Promise that resolves with
   * the verification result or rejects if the user cancels or an error occurs.
   */
  startLiveness: (params: IdentroRequestParams) => Promise<any>;
};

const IdentroContext = createContext<IdentroContextType | undefined>(undefined);

export function useIdentro() {
  const context = useContext(IdentroContext);
  if (!context) {
    throw new Error('useIdentro must be used within an IdentroProvider');
  }
  return context;
}

export function IdentroProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [requestParams, setRequestParams] = useState<IdentroRequestParams | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const startLiveness = useCallback((params: IdentroRequestParams) => {
    return new Promise<any>((resolve, reject) => {
      setRequestParams(params);
      setResolver({ resolve, reject });
      setIsActive(true);
    });
  }, []);

  const handleCompleted = useCallback((result: any) => {
    setIsActive(false);
    if (resolver) resolver.resolve(result);
    setRequestParams(null);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsActive(false);
    if (resolver) resolver.reject(new Error('User cancelled liveness verification'));
    setRequestParams(null);
    setResolver(null);
  }, [resolver]);

  const handleError = useCallback((error: any) => {
    setIsActive(false);
    if (resolver) resolver.reject(error);
    setRequestParams(null);
    setResolver(null);
  }, [resolver]);

  return (
    <IdentroContext.Provider value={{ startLiveness }}>
      {children}
      {isActive && requestParams && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <IdentroLiveness
            autoStart={true}
            autoStartSession={true}
            // Base URL is typically not needed when using custom handlers, but we provide it just in case
            baseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || ''}
            request={requestParams}
            handlers={{
              async createSession(req: any) {
                const res = await apiClient.post('/identity/liveness/sessions', req);
                console.log('Identro createSession RAW response:', res.data);
                const payload = res.data?.data || res.data;
                const unwrapped = payload?.reference ? payload : payload?.data?.reference ? payload.data : payload;
                console.log('Identro createSession UNWRAPPED payload:', unwrapped);
                return unwrapped;
              },
              async getCredentials(reference: string, session: any) {
                const res = await apiClient.post(`/identity/liveness/sessions/${reference}/credentials`, { session });
                const payload = res.data?.data || res.data;
                return payload?.credentials ? payload : payload?.data?.credentials ? payload.data : payload;
              },
              async completeSession(reference: string, session: any, payloadParams: any) {
                const res = await apiClient.post(`/identity/liveness/sessions/${reference}/complete`, payloadParams);
                const payload = res.data?.data || res.data;
                return payload?.status ? payload : payload?.data?.status ? payload.data : payload;
              }
            }}
            onCompleted={handleCompleted}
            onCancel={handleCancel}
            onError={handleError}
            branding={{
              name: 'RegentMFB',
              primaryColor: '#920793', // Regent primary color
              accentColor: '#B60CB7',
              fullscreenCamera: true,
            }}
          />
        </div>
      )}
    </IdentroContext.Provider>
  );
}
