import { usePinStore } from '../store/pin.store';
import { PinVerificationReason } from '../types/pin.types';

export function usePinVerification() {
  const { open, isTokenValid, clearToken, getRevealToken } = usePinStore();

  function requirePin(
    reason: PinVerificationReason,
    onSuccess: () => void,
    onCancel?: () => void
  ) {
    open(reason, onSuccess, onCancel);
  }

  return {
    requirePin,
    invalidateToken: clearToken,
    isTokenValid: isTokenValid(),
    revealToken: getRevealToken(),
  };
}
