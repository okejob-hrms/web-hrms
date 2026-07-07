'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { StatusKey } from '@/lib/i18n/status';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusBadgeProps {
  statusKey: StatusKey;
  variant?: BadgeVariant;
  className?: string;
  circleClassName?: string;
}

export function StatusBadge({
  statusKey,
  variant = 'default',
  className,
  circleClassName,
}: StatusBadgeProps) {
  const t = useTranslations('status');
  const label = statusKey === 'unknown' ? '-' : t(statusKey);

  return (
    <Badge
      variant={variant}
      className={cn(circleClassName && 'gap-1.5', className)}
    >
      {circleClassName ? (
        <span
          className={cn(circleClassName, 'h-2 w-2 shrink-0 rounded-full')}
          aria-hidden
        />
      ) : null}
      {label}
    </Badge>
  );
}
