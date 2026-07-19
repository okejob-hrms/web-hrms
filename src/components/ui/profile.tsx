'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePermissionStore } from '@/hooks/use-permission-store';

interface Props {
  className?: string;
  user?: {
    name: string;
  };
}

const Profile = React.memo(function Profile({ className, user }: Props) {
  const router = useRouter();
  const t = useTranslations('auth');
  const clearPermissions = usePermissionStore((state) => state.clear);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    clearPermissions();
    router.push('/auth/login');
  };

  return (
    <div className={cn('flex gap-3 items-center', className)}>
      <Avatar>
        <AvatarImage className="size-10" src="" alt="@shadcn" />
        <AvatarFallback className="size-8">
          {user?.name?.charAt(0) ?? 'HR'}
        </AvatarFallback>
      </Avatar>
      <div className="md:flex flex-col gap-1 hidden">
        <span className="font-semibold tracking-tight text-base">
          {user?.name}
        </span>
        <span className="leading-none text-xs text-muted-foreground">
          {user?.name}
        </span>
      </div>
      <Popover>
        <PopoverTrigger>
          <ChevronDown />
        </PopoverTrigger>
        <PopoverContent>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export { Profile };
