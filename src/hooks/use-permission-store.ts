import { create } from 'zustand';
import { getMyPermissions } from '@/services/auth/permissions';

const STORAGE_KEY = 'user_permissions';

interface PermissionState {
  permissions: string[];
  roles: string[];
  loaded: boolean;
  loading: boolean;
  hydrateFromStorage: () => void;
  load: () => Promise<void>;
  setPermissions: (permissions: string[], roles?: string[]) => void;
  clear: () => void;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}

const readStoredPermissions = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredPermissions = (permissions: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
};

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  roles: [],
  loaded: false,
  loading: false,

  hydrateFromStorage: () => {
    const permissions = readStoredPermissions();
    let roles: string[] = [];

    try {
      const rawRoles = localStorage.getItem('user_role');
      const parsed = rawRoles ? JSON.parse(rawRoles) : [];
      roles = Array.isArray(parsed) ? parsed : [];
    } catch {
      roles = [];
    }

    set({ permissions, roles });
  },

  setPermissions: (permissions, roles) => {
    writeStoredPermissions(permissions);
    set((state) => ({
      permissions,
      roles: roles ?? state.roles,
      loaded: true,
      loading: false,
    }));
  },

  load: async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      get().clear();
      return;
    }

    set({ loading: true });

    try {
      const res = await getMyPermissions();
      if (res.status === 'success') {
        const permissions = res.data.permissions ?? [];
        const roles = res.data.roles ?? [];
        writeStoredPermissions(permissions);
        localStorage.setItem('user_role', JSON.stringify(roles));
        set({
          permissions,
          roles,
          loaded: true,
          loading: false,
        });
        return;
      }

      set({ loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      permissions: [],
      roles: [],
      loaded: false,
      loading: false,
    });
  },

  can: (permission) => {
    if (!permission) {
      return true;
    }
    return get().permissions.includes(permission);
  },

  canAny: (permissions) => {
    if (!permissions.length) {
      return true;
    }
    const setPermissions = get().permissions;
    return permissions.some((permission) => setPermissions.includes(permission));
  },

  canAll: (permissions) => {
    if (!permissions.length) {
      return true;
    }
    const setPermissions = get().permissions;
    return permissions.every((permission) =>
      setPermissions.includes(permission),
    );
  },
}));
