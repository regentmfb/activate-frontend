'use client';

import { Suspense, useEffect } from 'react';
import Image from 'next/image';
import { SignInForm } from './SignInForm';

export function SignInLayout() {
  useEffect(() => {
    document.body.style.visibility = '';
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1" />
        <div className="w-full max-w-[520px] mx-auto px-8 md:px-12">
          <h1 className="text-[2.6rem] md:text-[3rem] font-black text-gray-900 leading-tight mb-4">
            Sign In to Activate
          </h1>
          <p className="text-[1.05rem] text-gray-400 leading-relaxed mb-12">
            Access your RegentMFB Activate portal<br />
            with your corporate credentials.
          </p>
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>
        <div className="flex-1" />
        <div className="px-8 md:px-12 pb-10 flex items-end justify-between">
          <p className="text-[12px] text-gray-400 leading-snug max-w-[220px]">
            © {new Date().getFullYear()} Regent Microfinance Bank.<br />All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* Right Panel — hidden on mobile/tablet */}
      <div
        className="hidden lg:flex w-[56%] flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#920793' }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(#ffffff 1px, transparent 1px),
              linear-gradient(90deg, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-8 w-full">
          <Image
            src="/logo/regentnewlogo.png"
            alt="RegentMFB"
            width={200}
            height={80}
            priority
            className="h-20 w-auto mb-12"
          />
          <h2 className="text-[2.6rem] font-black text-white text-center leading-tight mb-6">
            Welcome to RegentMFB<br />
            <span className="text-white/80 text-[2rem]">Activate</span>
          </h2>
          <p className="text-white/75 text-center text-[1.1rem] leading-relaxed max-w-md mb-14">
            Open accounts, manage customers, and track performance — all from your phone or tablet, even offline.
          </p>

          {/* Decorative card */}
          <div
            className="w-full rounded-2xl overflow-hidden relative flex items-end p-6"
            style={{
              height: '320px',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, #ffffff 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative z-10">
              <p className="text-white/90 text-[1.4rem] font-black leading-tight">
                Regent Microfinance Bank
              </p>
              <p className="text-white/50 text-[0.85rem] mt-1">
                Empowering Nigerians through accessible finance.
              </p>
            </div>
            <div className="absolute bottom-5 right-5">
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <span className="text-white text-[9px] font-bold tracking-[0.22em] uppercase">
                  Activate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
