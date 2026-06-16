export type StaffRole =
  | 'SUPER_ADMIN'
  | 'RM'
  | 'TELLER'
  | 'ACCOUNT_OFFICER'
  | 'TEAM_LEAD'
  | 'OPERATIONS'
  | 'INTERNAL_CONTROL'
  | 'CMO'
  | 'MD';

// ── Raw API shapes ────────────────────────────────────────────────────────────

export type HrmsPermission = {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  isActive: boolean;
};

export type HrmsRole = {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  isActive: boolean;
  permissions: HrmsPermission[];
};

export type HrmsPayload = {
  id: string;
  email: string;
  name: string;
  staffCode: string;
  hrmsId: string;
  hrmsRoles: string[];
  status: string;
  enabled: boolean;
  roles: HrmsRole[];
};

export type HrmsLoginResponse = {
  data: {
    payload: HrmsPayload;
    accessToken: string;
    expiresAt: string;
    expiresIn: number;
  };
  statusCode: number;
  succes: boolean;
};

// ── Internal app user ─────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  staffCode: string;
  hrmsId: string;
  hrmsRoles: string[];
  roles: HrmsRole[];
  permissions: string[];
  status: string;
  enabled: boolean;
};

// ── Orchestro SSO shapes ──────────────────────────────────────────────────────

export type OrchestroProfle = {
  staffId: string;
  staffName: string;
  email: string;
  role: StaffRole;
  active: boolean;
  permissions: string[];
};

export type OrchestrValidateResponse = {
  staffId: string;
  staffName: string;
  role: StaffRole;
};

// ── Form ──────────────────────────────────────────────────────────────────────

export type LoginPayload = {
  email: string;
  password: string;
};
