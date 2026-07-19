import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import { IUserPermissionsResponse } from './types';

export const getMyPermissions = async (): Promise<
  ApiResponse<IUserPermissionsResponse>
> => {
  const response = await api.get<ApiResponse<IUserPermissionsResponse>>(
    'user/permissions',
  );
  return response.json();
};
