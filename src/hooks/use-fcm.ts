'use client';

import { useEffect, useState } from 'react';
import { getMessaging, isSupported, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const permissionRequest = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn('Firebase Messaging is not supported in this browser.');
          return;
        }

        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register the service worker via our Next.js rewrite
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;
          
          let tokenParams: any = {
            serviceWorkerRegistration: registration,
          };

          let currentToken: string | null = null;
          try {
            currentToken = await getToken(messaging);
          } catch (err: any) {
            console.error('Error getting initial token:', err);
            // If the token is already expired or error, try deleting it and generating a new one
            try {
              await deleteToken(messaging);
              currentToken = await getToken(messaging, tokenParams);
            } catch (retryErr) {
              console.error('Error in regenerate token:', retryErr);
            }
          }

          if (currentToken) {
            setFcmToken(currentToken);
            
            // Sync the token with backend if user is authenticated
            const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (authToken) {
              try {
                await api.put('user/fcm-token', {
                  json: {
                    token: currentToken,
                    platform: 2 // 2 for web
                  }
                });
              } catch (apiError) {
                console.error('Error syncing FCM token to backend:', apiError);
              }
            } else {
              console.info('User not logged in, skipping FCM token sync to backend');
            }
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
          
          onMessage(messaging, (payload) => {
            const title = payload.notification?.title || 'New Notification';
            const body = payload.notification?.body || '';
            toast(title, {
              description: body,
            });
          });
        }
      } catch (err) {
        console.error('An error occurred while retrieving FCM token. ', err);
      }
    };

    permissionRequest();

  }, []);

  return { fcmToken };
};
