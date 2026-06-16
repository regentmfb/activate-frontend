import orchestroClient, { saveToken } from '@/src/lib/orchestro-client';
import apiClient from '@/src/lib/api-client';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/src/constants/permissions';
import type {
  AuthUser,
  HrmsLoginResponse,
  HrmsPayload,
  LoginPayload,
  OrchestroProfle,
  OrchestrValidateResponse,
  StaffRole,
} from '../types/auth.types';
const http = orchestroClient;

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

function isSuperAdmin(payload: HrmsPayload): boolean {
  return payload.hrmsId === '1' || payload.hrmsRoles.includes('company');
}

function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

/** Map Orchestro permission codes → Activate internal CAN_* permissions */
const ORCHESTRO_PERMISSION_MAP: Record<string, string> = {
  'activate.account.open':               'CAN_OPEN_ACCOUNT',
  'activate.account.upgrade':            'CAN_UPGRADE_ACCOUNT',
  'activate.loan.submit':                'CAN_SUBMIT_LOAN',
  'activate.workflow.review':            'CAN_REVIEW_WORKFLOW',
  'activate.account.approve':            'CAN_APPROVE_ACCOUNT',
  'activate.lien.place':                 'CAN_PLACE_LIEN',
  'activate.data.view_sensitive':        'CAN_VIEW_SENSITIVE_DATA',
  'activate.dashboard.view_team':        'CAN_VIEW_TEAM_DASHBOARD',
  'activate.dashboard.view_branch':      'CAN_VIEW_BRANCH_DASHBOARD',
  'activate.dashboard.view_management':  'CAN_VIEW_MANAGEMENT_DASHBOARD',
  'activate.dashboard.view_own':         'CAN_VIEW_SENSITIVE_DATA',
  'activate.staff.view':                 'CAN_VIEW_STAFF',
};

function mapPermissions(raw: string[]): string[] {
  return Array.from(new Set(
    raw.flatMap(p => {
      const mapped = ORCHESTRO_PERMISSION_MAP[p];
      return mapped ? [p, mapped] : [p];
    })
  ));
}

/** Fallback: derive CAN_* permissions from role name strings using local map */
function permissionsFromRoles(hrmsRoles: string[]): string[] {
  const perms = new Set<string>();
  for (const role of hrmsRoles) {
    const mapped = ROLE_PERMISSIONS[role.toUpperCase() as StaffRole];
    if (mapped) mapped.forEach(p => perms.add(p));
  }
  return Array.from(perms);
}

function toAuthUser(payload: HrmsPayload): AuthUser {
  const { firstName, lastName } = splitName(payload.name);

  let permissions: string[];
  if (isSuperAdmin(payload)) {
    permissions = ALL_PERMISSIONS;
  } else {
    // HRMS role permissions (may use Orchestro codes or legacy names)
    const hrmsPerms = Array.from(new Set(payload.roles.flatMap((r) => r.permissions.map((p) => p.name))));
    // Map Orchestro codes → CAN_* and also add CAN_* from role names as fallback
    const rolePerms = permissionsFromRoles(payload.hrmsRoles);
    permissions = Array.from(new Set([...mapPermissions(hrmsPerms), ...rolePerms]));
  }

  return {
    id: payload.id,
    name: payload.name,
    firstName,
    lastName,
    email: payload.email,
    staffCode: payload.staffCode,
    hrmsId: payload.hrmsId,
    hrmsRoles: payload.hrmsRoles,
    roles: payload.roles,
    permissions,
    status: payload.status,
    enabled: payload.enabled,
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthUser> => {
    // 1. Authenticate with Orchestro directly
    const { data } = await http.post<HrmsLoginResponse>('/hrms-auth/login', payload);
    saveToken(data.data.accessToken);
    
    // 2. Validate against our backend (which enforces role/permission checks)
    const backendUser = await authApi.me();
    return backendUser;
  },

  me: async (): Promise<AuthUser> => {
    // Hits activate-backend
    const response = await apiClient.get<any>('/auth/me');
    const profile = response.data?.data || response.data;
    
    const { firstName, lastName } = splitName(profile?.staffName);
    const permissions = mapPermissions(profile?.permissions ?? []);
    
    return {
      id: profile?.staffId,
      name: profile?.staffName,
      firstName,
      lastName,
      email: profile?.email,
      staffCode: profile?.staffCode || '',
      hrmsId: profile?.staffId,
      hrmsRoles: [profile?.role], // backend returns the main resolved role as data.role
      roles: [],
      permissions,
      status: profile?.active ? 'active' : 'inactive',
      enabled: profile?.active,
    };
  },

  validate: async (token: string): Promise<OrchestrValidateResponse> => {
    saveToken(token);
    // Hits activate-backend
    const response = await apiClient.post<any>('/auth/validate');
    return response.data?.data || response.data;
  },

  permissions: async (): Promise<string[]> => {
    // Hits activate-backend
    const response = await apiClient.get<any>('/auth/permissions');
    return response.data?.data || response.data;
  },
};
