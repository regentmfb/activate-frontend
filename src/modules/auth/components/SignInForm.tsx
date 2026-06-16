'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { signInSchema, type SignInSchemaValues } from '../schema/auth.schema';
import { useSignIn } from '../hooks/useAuth';
import { cn } from '@src/utils';

const REMEMBERED_EMAIL_KEY = 'activate_remembered_email';

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { mutate: signIn, isPending } = useSignIn(() => setRedirecting(true));
  const busy = isPending || redirecting;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignInSchemaValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) setValue('email', saved);
  }, [setValue]);

  function handleSignIn(data: SignInSchemaValues) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
    signIn(data);
  }

  return (
    <form onSubmit={handleSubmit(handleSignIn)} className="space-y-7">

      {/* Email */}
      <div className="space-y-2.5">
        <label className="block text-[11px] font-bold tracking-[0.18em] text-gray-400 uppercase">
          Email
        </label>
        <input
          type="email"
          placeholder="john.doe@regentmfb.com"
          autoComplete="email"
          className={cn(
            'w-full h-[56px] px-4 rounded-lg text-[16px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300',
            errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'
          )}
          {...register('email')}
        />
        {errors.email && <p className="text-[13px] text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2.5">
        <label className="block text-[11px] font-bold tracking-[0.18em] text-gray-400 uppercase">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(
              'w-full h-[56px] px-4 pr-12 rounded-lg text-[16px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300',
              errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'
            )}
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-[13px] text-red-500">{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={busy}
        className="w-full h-[60px] rounded-xl text-white text-[17px] font-bold tracking-wide transition-opacity disabled:opacity-60 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
        style={{ backgroundColor: '#920793' }}
      >
        {busy ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
          </svg>
        ) : 'Sign In'}
      </button>
    </form>
  );
}
