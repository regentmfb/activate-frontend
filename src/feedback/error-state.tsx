import { AlertCircleIcon } from 'lucide-react';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: Props) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-destructive">
      <AlertCircleIcon className="h-10 w-10 opacity-70" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground"
        >
          Retry
        </button>
      )}
    </div>
  );
}
