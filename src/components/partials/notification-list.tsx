'use client';

import * as React from 'react';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { LucideBell } from 'lucide-react';
import { useLocale } from 'next-intl';

import { api } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveLocale } from '@/lib/i18n/locale';

interface WhatsNewPayload {
  slug?: string;
  docs_path?: string;
  title_en?: string;
  title_id?: string;
  message_en?: string;
  message_id?: string;
}

interface NotificationData {
  title: string;
  message: string;
  code: string;
  data?: WhatsNewPayload & Record<string, unknown>;
}

interface NotificationItem {
  id: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

function getWhatsNewDisplay(
  item: NotificationItem,
  locale: string
): { title: string; message: string } {
  const payload = item.data.data;
  const isEn = resolveLocale(locale) === 'en';

  if (item.data.code !== 'WHATS_NEW' || !payload) {
    return { title: item.data.title, message: item.data.message };
  }

  const title = isEn
    ? payload.title_en || item.data.title
    : payload.title_id || item.data.title;
  const message = isEn
    ? payload.message_en || item.data.message
    : payload.message_id || item.data.message;

  return { title, message };
}

interface NotificationResponse {
  data: NotificationItem[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
  };
}

export function NotificationList() {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      return await api.get(`user/notifications?page=${pageParam}`).json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchInterval: 60000,
  });

  const notifications = data?.pages.flatMap((page) => page.data) || [];

  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleNotificationClick = (item: NotificationItem) => {
    const code = item.data.code;
    let targetRoute = '';

    switch (code) {
      case 'PROFILE_UPDATED':
      case 'DEPARTMENT_CHANGED':
      case 'MANAGER_CHANGED':
        targetRoute = '/ess';
        break;
      case 'OFFBOARDING_STARTED':
      case 'EXIT_INTERVIEW_SCHEDULE':
      case 'OFFBOARDING_VALIDATE_HANDOVER':
        targetRoute = '/employee/off-boarding';
        break;
      case 'ATTENDANCE_REMINDER':
      case 'ATTENDANCE_NOT_PRESENT':
        targetRoute = '/attendance/attendance-tracker';
        break;
      case 'OVERTIME_SUBMITTED':
      case 'OVERTIME_UPDATED':
        targetRoute = '/attendance/over-time';
        break;
      case 'LEAVE_SUBMITTED':
      case 'LEAVE_UPDATED':
      case 'LEAVE_REMINDER':
      case 'LEAVE_EXPIRING':
        targetRoute = '/attendance/leave-request';
        break;
      case 'PAYSLIP_AVAILABLE':
        targetRoute = '/payroll/list';
        break;
      case 'PAYSLIP_REQUEST_UPDATED':
        targetRoute = '/payroll/request';
        break;
      case 'PERFORMANCE_FORM_OPEN':
      case 'PERFORMANCE_REMINDER':
      case 'PERFORMANCE_SUBMITTED':
      case 'PERFORMANCE_PUBLISHED':
      case 'SELF_ASSESSMENT_REMINDER':
        targetRoute = '/performance/self-assessment';
        break;
      case 'OFFBOARDING_VALIDATE_HANDOVER':
        targetRoute = '/employee/off-boarding';
        break;
      case 'WHATS_NEW':
        targetRoute =
          (typeof item.data.data?.docs_path === 'string' && item.data.data.docs_path) ||
          '/docs/changelog';
        break;
      default:
        break;
    }

    setOpen(false);

    if (targetRoute) {
      router.push(targetRoute);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative bg-background rounded-full size-8 p-0 hover:bg-gray-100">
          <Image
            src="/icons/notification.svg"
            alt="icon-notification"
            width={20}
            height={20}
            className="pointer-events-none"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <Separator />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <LucideBell className="animate-pulse mb-2 opacity-20" size={24} />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400 shrink-0">
            <span className="text-xs text-red-500">Failed to load notifications</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <Image 
              src="/icons/notification.svg" 
              alt="Empty" 
              width={32} 
              height={32} 
              className="opacity-20 mb-3 grayscale"
            />
            <span className="text-xs">No notifications yet</span>
          </div>
        ) : (
          <ScrollArea className="h-[350px] overflow-y-auto">
            <div className="flex flex-col">
              {notifications.map((notification, index) => {
                const display = getWhatsNewDisplay(notification, locale);

                return (
                <div
                  key={notification.id}
                  ref={index === notifications.length - 1 ? lastNotificationRef : null}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex flex-col gap-1 p-4 text-sm cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-0",
                    !notification.read_at && "bg-blue-50/40"
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-gray-800 line-clamp-1">
                      {display.title}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap min-w-max mt-0.5">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed text-left cursor-default">
                          {display.message}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] z-[100] break-words">
                        <p className="text-xs whitespace-pre-wrap">{display.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                );
              })}
              {isFetchingNextPage && (
                <div className="p-4 text-center text-xs text-gray-400">
                  Loading more...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" className="w-full text-xs text-primary h-8" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

