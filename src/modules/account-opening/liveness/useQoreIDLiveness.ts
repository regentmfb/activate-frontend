'use client';

import { useState } from 'react';
import { usePictureVerification, useCreateQoreIdSession } from '../../identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';
import QoreID from '@qore-id/web-sdk';

export type LivenessStatus = 'idle' | 'scanning' | 'verifying' | 'failed' | 'passed';

export interface ApplicantBiodata {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  [key: string]: any;
}

export interface LivenessFormState {
  verificationId?: string | null;
  clientReference: string;
  identityValue: string;
  verificationMethod: string;
  firstName?: string | null;
  lastName?: string | null;
  biodata?: ApplicantBiodata | null;
}

interface UseQoreIDLivenessProps {
  formState: LivenessFormState;
  onSuccess: (imageData: string) => void;
  onFail?: () => void;
}

function formatNigerianPhoneNumber(phoneStr?: string | null): string {
  let phone = phoneStr || '';
  phone = phone.replace(/\D/g, '');
  
  if (phone.startsWith('234')) {
    phone = '+' + phone;
  } else if (phone.length === 11 && phone.startsWith('0')) {
    phone = '+234' + phone.slice(1);
  }
  
  if (!phone.startsWith('+234') || phone.length !== 14) {
    return '+2348030000000';
  }
  
  return phone;
}

function setupIframeObserver(): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IFRAME') {
          const iframe = node as HTMLIFrameElement;
          iframe.setAttribute('allow', 'camera *; microphone *; geolocation *; display-capture *');
        } else if (node instanceof HTMLElement) {
          const iframes = node.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.setAttribute('allow', 'camera *; microphone *; geolocation *; display-capture *');
          });
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

export function useQoreIDLiveness({ formState, onSuccess, onFail }: UseQoreIDLivenessProps) {
  const [status, setStatus] = useState<LivenessStatus>('idle');
  const { mutate: pictureVerification } = usePictureVerification();
  const { mutateAsync: createSession } = useCreateQoreIdSession();

  async function triggerLiveness() {
    if (!formState.verificationId) {
      appToast.error('No verification session active.');
      return;
    }

    try {
      setStatus('scanning');

      // Temporarily suppress CustomEvent console.error from QoreID SDK
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0] === '...') return;
        if (args[0] && args[0].type === 'qoreid:verificationError') return;
        if (args[0] && typeof args[0] === 'string' && args[0].includes('QoreID')) return;
        if (args[0] instanceof CustomEvent) return;
        originalConsoleError.apply(console, args);
      };

      const { sdkSessionToken } = await createSession(formState.verificationId);

      QoreID.on('success', (data: any) => {
        const imageStr = data?.image || '';
        const imageData = imageStr.startsWith('data:') ? imageStr : `data:image/jpeg;base64,${imageStr}`;
        
        setStatus('verifying');
        
        pictureVerification(
          {
            verificationId: formState.verificationId!,
            identifier: formState.identityValue,
            firstName: formState.biodata?.firstName || formState.firstName || '',
            lastName: formState.biodata?.lastName || formState.lastName || '',
            imageBase64: imageData,
          },
          {
            onSuccess: (res) => {
              if (res.status === 'FAILED') {
                appToast.error('Liveness check failed.');
                setStatus('failed');
                onFail?.();
              } else {
                appToast.success('Liveness verification successful!');
                setStatus('passed');
                onSuccess(imageData);
              }
            },
            onError: (err) => {
              appToast.error(err.message || 'Liveness verification failed.');
              setStatus('failed');
              onFail?.();
            },
          }
        );
      });

      QoreID.on('error', (error: any) => {
        appToast.error(error?.message || 'Liveness capture failed');
        setStatus('failed');
        onFail?.();
      });

      const observer = setupIframeObserver();

      QoreID.on('close', () => {
        setStatus((prev) => (prev === 'scanning' ? 'idle' : prev));
        observer.disconnect();
        console.error = originalConsoleError;
      });

      const phone = formatNigerianPhoneNumber(formState.biodata?.phone);

      const applicantData = {
        firstname: formState.biodata?.firstName || formState.firstName || '',
        lastname: formState.biodata?.lastName || formState.lastName || '',
        phoneNumber: phone,
        phone: phone,
      };

      const identityData = {
        idType: formState.verificationMethod?.toLowerCase() || 'bvn',
        idNumber: formState.identityValue,
      };

      await QoreID.start({
        clientId: process.env.NEXT_PUBLIC_QOREID_CLIENT_ID,
        productCode: formState.verificationMethod === 'NIN' 
          ? process.env.NEXT_PUBLIC_QOREID_PRODUCT_CODE_NIN || 'liveness_nin'
          : process.env.NEXT_PUBLIC_QOREID_PRODUCT_CODE_BVN || 'liveness_bvn',
        token: sdkSessionToken,
        customerReference: formState.clientReference,
        applicantData,
        identityData,
      } as any);

    } catch (err: any) {
      appToast.error(err.message || 'Failed to initialize liveness scanner');
      setStatus('failed');
    }
  }

  return {
    triggerLiveness,
    status,
    setStatus,
  };
}
