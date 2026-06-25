'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { X, RefreshCw, ScanFace, SwitchCamera, Timer } from 'lucide-react';

type Props = {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
};

type Status = 'loading' | 'ready' | 'scanning' | 'flash' | 'captured' | 'error';

// Oval dimensions (in the 390×680 SVG viewBox)
const CX = 195, CY = 295, RX = 118, RY = 152;

export function FaceCaptureModal({ onCapture, onClose }: Props) {
  const webcamRef   = useRef<Webcam>(null);
  const flashRef    = useRef<HTMLDivElement>(null);
  const [status, setStatus]           = useState<Status>('loading');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode]   = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown]     = useState<number | null>(null);

  // Cleanup on unmount
  useEffect(() => () => { setCapturedUrl(null); }, []);

  // Countdown timer logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCountdown(null);
      shoot();
    }
  }, [countdown]);

  const handleUserMedia = useCallback(() => setStatus('ready'), []);
  const handleUserMediaError = useCallback(() => setStatus('error'), []);

  function toggleCamera() {
    setStatus('loading');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  function shoot() {
    if (status !== 'ready') return;
    setStatus('scanning');

    // After 2.2s scan, flash then capture
    setTimeout(() => {
      setStatus('flash');
      setTimeout(() => {
        const url = webcamRef.current?.getScreenshot() ?? null;
        setCapturedUrl(url);
        setStatus(url ? 'captured' : 'error');
      }, 350);
    }, 2200);
  }

  function retake() {
    setCapturedUrl(null);
    setStatus('ready');
  }

  // Oval circumference (Ramanujan approximation)
  const C = Math.PI * (3 * (RX + RY) - Math.sqrt((3 * RX + RY) * (RX + 3 * RY)));

  // Corner bracket paths (4 corners of the oval)
  const brackets = [
    { tx: CX - RX + 4,  ty: CY - RY + 2,  r: 0   },
    { tx: CX + RX - 4,  ty: CY - RY + 2,  r: 90  },
    { tx: CX + RX - 4,  ty: CY + RY - 2,  r: 180 },
    { tx: CX - RX + 4,  ty: CY + RY - 2,  r: 270 },
  ];

  const isLive = status !== 'captured';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col select-none" style={{ background: '#f5f5f5' }}>

      {/* ── Flash overlay ─────────────────────────────────────── */}
      {status === 'flash' && (
        <div className="fc-flash absolute inset-0 z-10 pointer-events-none" style={{ background: 'rgba(0,0,0,0.15)' }} />
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <X className="h-4 w-4 text-gray-800" />
        </button>
        <p className="text-gray-900 text-[13px] font-semibold tracking-[0.08em] uppercase">
          Face Verification
        </p>
        <div className="w-9" />
      </div>

      {/* ── Camera + overlay ──────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-black">

        {/* Live webcam */}
        {isLive && (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.96}
            videoConstraints={{ facingMode }}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            mirrored={facingMode === 'user'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Captured preview */}
        {!isLive && capturedUrl && (
          <img
            src={capturedUrl}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* ── SVG overlay ─────────────────────────────────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 390 680"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Cutout mask */}
            <mask id="fc-cutout">
              <rect width="390" height="680" fill="white" />
              <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="black" />
            </mask>

            {/* Scan line gradient */}
            <linearGradient id="fc-scan-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#920793" stopOpacity="0" />
              <stop offset="40%"  stopColor="#920793" stopOpacity="0.9" />
              <stop offset="50%"  stopColor="#d946ef" stopOpacity="1" />
              <stop offset="60%"  stopColor="#920793" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#920793" stopOpacity="0" />
            </linearGradient>

            {/* Clip to oval interior for scan line */}
            <clipPath id="fc-oval-clip">
              <ellipse cx={CX} cy={CY} rx={RX - 1} ry={RY - 1} />
            </clipPath>

            {/* Glow filter for scan line */}
            <filter id="fc-glow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Light surround */}
          <rect width="390" height="680" fill="rgba(245,245,245,0.88)" mask="url(#fc-cutout)" />

          {/* ── Idle / scanning state ── */}
          {(status === 'ready' || status === 'scanning' || status === 'flash' || status === 'loading') && (
            <>
              {/* Oval border */}
              <ellipse
                cx={CX} cy={CY} rx={RX} ry={RY}
                fill="none"
                stroke={status === 'scanning' || status === 'flash' ? '#920793' : 'rgba(0,0,0,0.2)'}
                strokeWidth={status === 'scanning' || status === 'flash' ? '2.5' : '1.5'}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />

              {/* Corner brackets — pulse when scanning */}
              {brackets.map((b, i) => (
                <g
                  key={i}
                  transform={`translate(${b.tx},${b.ty}) rotate(${b.r})`}
                  className={status === 'scanning' ? 'fc-bracket-pulse' : ''}
                  style={{ transformOrigin: `${b.tx}px ${b.ty}px` }}
                >
                  <path
                    d="M-16,0 L0,0 L0,16"
                    fill="none"
                    stroke={status === 'scanning' ? '#920793' : 'rgba(0,0,0,0.35)'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'stroke 0.3s' }}
                  />
                </g>
              ))}

              {/* Laser scan line — only while scanning */}
              {status === 'scanning' && (
                <g clipPath="url(#fc-oval-clip)">
                  <rect
                    x={CX - RX}
                    width={RX * 2}
                    height="28"
                    fill="url(#fc-scan-grad)"
                    filter="url(#fc-glow)"
                    className="fc-scan-line"
                    style={{ position: 'relative' }}
                  />
                </g>
              )}
            </>
          )}

          {/* ── Captured state — just the surround, no ring ── */}
          {status === 'captured' && (
            <rect width="390" height="680" fill="rgba(245,245,245,0.88)" mask="url(#fc-cutout)" />
          )}
        </svg>

        {/* ── Loading dots ─────────────────────────────────────── */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 z-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full bg-gray-400 fc-dot-${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom controls ───────────────────────────────────── */}
      <div className="shrink-0 px-6 pb-10 pt-5 flex flex-col items-center gap-3 z-20">

        {/* Loading */}
        {status === 'loading' && (
          <p className="text-gray-400 text-[12px]">Starting camera…</p>
        )}

        {/* Ready */}
        {status === 'ready' && (
          <>
            <p className="text-gray-900 text-[15px] font-semibold">Position face in the oval</p>
            <p className="text-gray-400 text-[12px] text-center">Good lighting · Look straight · Keep still</p>
            <div className="mt-1 relative flex items-center justify-center w-full">
              <button
                onClick={() => setCountdown(3)}
                disabled={countdown !== null}
                className="absolute left-8 h-12 w-12 rounded-full bg-gray-100 flex flex-col items-center justify-center text-gray-700 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Timer className="h-4 w-4" />
                <span className="text-[9px] font-bold mt-0.5">AUTO</span>
              </button>

              <div className="h-[72px] w-[72px] rounded-full border-[3px] border-gray-200 flex items-center justify-center">
                {countdown !== null ? (
                  <div className="h-[56px] w-[56px] rounded-full flex items-center justify-center bg-purple-50 text-[#920793] font-bold text-2xl">
                    {countdown}
                  </div>
                ) : (
                  <button
                    onClick={shoot}
                    className="h-[56px] w-[56px] rounded-full active:scale-90 transition-transform duration-100 shadow-md"
                    style={{ background: '#920793' }}
                  />
                )}
              </div>

              <button
                onClick={toggleCamera}
                disabled={countdown !== null}
                className="absolute right-8 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform disabled:opacity-50"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>
            </div>
          </>
        )}

        {/* Scanning */}
        {status === 'scanning' && (
          <>
            <p className="text-[15px] font-bold text-gray-900">Hold still</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full fc-dot-1" style={{ background: '#920793' }} />
              <div className="h-1.5 w-1.5 rounded-full fc-dot-2" style={{ background: '#920793' }} />
              <div className="h-1.5 w-1.5 rounded-full fc-dot-3" style={{ background: '#920793' }} />
            </div>
            <div className="h-[72px] w-[72px] rounded-full border-[3px] border-gray-200 flex items-center justify-center">
              <div className="h-[56px] w-[56px] rounded-full bg-gray-200" />
            </div>
          </>
        )}

        {/* Flash */}
        {status === 'flash' && <div className="h-[72px]" />}

        {/* Captured */}
        {status === 'captured' && (
          <>
            <p className="text-gray-900 text-[15px] font-bold">Photo captured</p>
            <p className="text-gray-400 text-[12px]">Use this photo or retake</p>
            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={retake}
                className="flex-1 h-12 rounded-2xl text-gray-700 text-[13px] font-semibold flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Retake
              </button>
              <button
                onClick={() => capturedUrl && onCapture(capturedUrl)}
                className="flex-1 h-12 rounded-2xl text-white text-[14px] font-bold transition-opacity hover:opacity-90"
                style={{ background: '#920793' }}
              >
                Use Photo
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="flex items-center gap-2">
              <ScanFace className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-[13px] font-semibold">Camera unavailable</p>
            </div>
            <p className="text-gray-400 text-[12px] text-center">
              Allow camera access in your browser settings, then try again.
            </p>
            <button
              onClick={() => setStatus('loading')}
              className="h-11 px-6 rounded-xl text-gray-700 text-[13px] font-semibold flex items-center gap-2 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </>
        )}

      </div>
    </div>
  );
}
