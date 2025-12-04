import ky from 'ky';
import { useLoadingStore } from '@/hooks/use-loading-store';

// ====== Global loading triggers ======
const startLoading = () => {
  if (typeof window !== 'undefined') {
    useLoadingStore.getState().start();
  }
};

const endLoading = () => {
  if (typeof window !== 'undefined') {
    useLoadingStore.getState().end();
  }
};

// ====== Base URL fallback ======
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://api.okejobhub.fun/api/v1';

const BASE_URL_RECOGNITION =
  process.env.NEXT_PUBLIC_BASE_URL_RECOGNITION || 'https://face.okejobhub.fun/api/v1';

// ====== Public API (no auth) ======
export const apiPublic = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      () => {
        startLoading();
      },
    ],
    afterResponse: [
      () => {
        endLoading();
      },
    ],
    beforeError: [
      (error) => {
        endLoading();
        return error;
      },
    ],
  },
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ====== Authenticated API ======
export const api = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request) => {
        startLoading();
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        request.headers.set('Accept', 'application/json');
        request.headers.set('Content-Type', 'application/json');
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        endLoading();
        if (response.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }
        return response;
      },
    ],
    beforeError: [
      (error) => {
        endLoading();
        return error;
      },
    ],
  },
});

// ====== Upload API (multipart/form-data) ======
export const apiUpload = ky.create({
  prefixUrl: BASE_URL,
  timeout: 30000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request) => {
        startLoading();
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        request.headers.set('Accept', 'application/json');
      },
    ],
    afterResponse: [
      () => {
        endLoading();
      },
    ],
    beforeError: [
      (error) => {
        endLoading();
        return error;
      },
    ],
  },
});

export const apiRecognition = ky.create({
  prefixUrl: BASE_URL_RECOGNITION,
  timeout: 10000,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request, options) => {
        startLoading();

        const token =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        request.headers.set("Accept", "application/json");

        // JANGAN set multipart/form-data secara manual!
        const isFormData = options.body instanceof FormData;

        if (!isFormData) {
          request.headers.set("Content-Type", "application/json");
        }
        // else: biarkan kosong → ky akan buat otomatis
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        endLoading();
        if (response.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }
        return response;
      },
    ],
    beforeError: [
      (error) => {
        endLoading();
        return error;
      },
    ],
  },
});

