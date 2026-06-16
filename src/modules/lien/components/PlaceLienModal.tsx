'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { usePlaceLien } from '../hooks/useLien';
import type { LienFormData } from '../types/lien.types';

const placeLienSchema = z.object({
  accountNumber: z
    .string()
    .min(10, 'Account number must be at least 10 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

type PlaceLienFormData = z.infer<typeof placeLienSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  accountNumber?: string;
  amount?: number;
};

export function PlaceLienModal({ isOpen, onClose, accountNumber }: Props) {
  const placeLienMutation = usePlaceLien();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlaceLienFormData>({
    resolver: zodResolver(placeLienSchema),
    defaultValues: {
      accountNumber: accountNumber || '',
      amount: '',
      reason: '',
    },
  });

  const onSubmit = async (data: PlaceLienFormData) => {
    try {
      await placeLienMutation.mutateAsync({
        accountNumber: data.accountNumber,
        amount: Number(data.amount),
        reason: data.reason,
        requestId: crypto.randomUUID(),
      });
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Place Lien</h2>
              <p className="text-sm text-gray-500">Place a hold on customer account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              {...register('accountNumber')}
              placeholder="Enter account number"
              className="mt-1"
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount')}
              placeholder="Enter lien amount"
              className="mt-1"
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Enter reason for placing lien (e.g., Suspected duplicate registration / non-compliant coordinates)"
              rows={3}
              className="mt-1"
            />
            {errors.reason && (
              <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={placeLienMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={placeLienMutation.isPending}
            >
              {placeLienMutation.isPending ? 'Placing Lien...' : 'Place Lien'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}