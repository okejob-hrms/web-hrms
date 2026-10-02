import { api, apiEmployee } from '@/lib/api';

export interface EssProfileData {
  // identity (read-only)
  name: string;
  email: string;
  id_number?: string | null;
  npwp?: string | null;
  bpjs?: string | null;
  marital_status?: string | null;
  marital_status_label?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  gender_label?: string | null;
  // editable
  phone_number?: string | null;
  residential_address?: string | null;
  citizen_id_address?: string | null;
  place_of_birth?: string | null;
  blood_type?: string | null;
  photo_profile_url?: string | null;
  // extra
  employee_code?: string | null;
  department?: string | null;
  job_position?: string | null;
  job_level?: string | null;
  start_date?: string | null;
}

export interface EssProfileResponse {
  status: string;
  message: string;
  data: EssProfileData;
}

export const getEssProfile = async (): Promise<EssProfileResponse> => {
  const res = await apiEmployee.get<EssProfileResponse>('ess/profile');
  return res.json();
};

export interface EssProfileUpdatePayload {
  phone_number?: string;
  residential_address?: string;
  citizen_id_address?: string;
  place_of_birth?: string;
  blood_type?: string;
}

export const updateEssProfile = async (
  payload: EssProfileUpdatePayload,
): Promise<EssProfileResponse> => {
  // NOTE: The ESS-scoped PUT ess/profile route does not exist in core (api-ess.php).
  // The canonical update path is PUT user/profile (api-v1.php) which accepts the same
  // editable fields. Switch to `apiEmployee` + `ess/profile` if the route is added.
  // Backend B1.3 already ignores protected identity fields on this endpoint.
  const res = await api.put<EssProfileResponse>('user/profile', { json: payload });
  return res.json();
};
