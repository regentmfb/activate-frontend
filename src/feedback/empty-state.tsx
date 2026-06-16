import { InboxIcon } from 'lucide-react';

type Props = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: Props) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
      <InboxIcon className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs">{description}</p>}
      {action}
    </div>
  );
}
