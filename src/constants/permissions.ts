import { StaffRole } from '@src/modules/auth/types/auth.types';

// ── All permissions ───────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Account operations
  CAN_OPEN_ACCOUNT:              'CAN_OPEN_ACCOUNT',
  CAN_UPGRADE_ACCOUNT:           'CAN_UPGRADE_ACCOUNT',
  CAN_SUBMIT_LOAN:               'CAN_SUBMIT_LOAN',

  // Workflow
  CAN_REVIEW_WORKFLOW:           'CAN_REVIEW_WORKFLOW',
  CAN_APPROVE_ACCOUNT:           'CAN_APPROVE_ACCOUNT',
  CAN_PLACE_LIEN:                'CAN_PLACE_LIEN',

  // Sensitive data
  CAN_VIEW_SENSITIVE_DATA:       'CAN_VIEW_SENSITIVE_DATA',

  // Dashboard tiers
  CAN_VIEW_TEAM_DASHBOARD:       'CAN_VIEW_TEAM_DASHBOARD',
  CAN_VIEW_BRANCH_DASHBOARD:     'CAN_VIEW_BRANCH_DASHBOARD',
  CAN_VIEW_MANAGEMENT_DASHBOARD: 'CAN_VIEW_MANAGEMENT_DASHBOARD',
  CAN_VIEW_BOARD_DASHBOARD:      'CAN_VIEW_BOARD_DASHBOARD',
  CAN_VIEW_STAFF:                'CAN_VIEW_STAFF',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ── Role → permissions map (single source of truth) ──────────────────────────

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  SUPER_ADMIN: [
    'CAN_OPEN_ACCOUNT',
    'CAN_UPGRADE_ACCOUNT',
    'CAN_SUBMIT_LOAN',
    'CAN_REVIEW_WORKFLOW',
    'CAN_APPROVE_ACCOUNT',
    'CAN_PLACE_LIEN',
    'CAN_VIEW_SENSITIVE_DATA',
    'CAN_VIEW_TEAM_DASHBOARD',
    'CAN_VIEW_BRANCH_DASHBOARD',
    'CAN_VIEW_MANAGEMENT_DASHBOARD',
    'CAN_VIEW_BOARD_DASHBOARD',
    'CAN_VIEW_STAFF',
  ],
  RM: [
    'CAN_OPEN_ACCOUNT',
    'CAN_UPGRADE_ACCOUNT',
    'CAN_SUBMIT_LOAN',
    'CAN_VIEW_SENSITIVE_DATA',
  ],
  TELLER: [
    'CAN_VIEW_SENSITIVE_DATA',
  ],
  ACCOUNT_OFFICER: [
    'CAN_OPEN_ACCOUNT',
    'CAN_UPGRADE_ACCOUNT',
    'CAN_VIEW_SENSITIVE_DATA',
  ],
  TEAM_LEAD: [
    'CAN_OPEN_ACCOUNT',
    'CAN_UPGRADE_ACCOUNT',
    'CAN_SUBMIT_LOAN',
    'CAN_VIEW_TEAM_DASHBOARD',
    'CAN_VIEW_SENSITIVE_DATA',
    'CAN_VIEW_STAFF',
  ],
  OPERATIONS: [
    'CAN_APPROVE_ACCOUNT',
    'CAN_REVIEW_WORKFLOW',
    'CAN_PLACE_LIEN',
    'CAN_VIEW_SENSITIVE_DATA',
  ],
  INTERNAL_CONTROL: [
    'CAN_APPROVE_ACCOUNT',
    'CAN_REVIEW_WORKFLOW',
    'CAN_PLACE_LIEN',
    'CAN_VIEW_SENSITIVE_DATA',
  ],
  CMO: [
    'CAN_OPEN_ACCOUNT',
    'CAN_UPGRADE_ACCOUNT',
    'CAN_SUBMIT_LOAN',
    'CAN_VIEW_TEAM_DASHBOARD',
    'CAN_VIEW_BRANCH_DASHBOARD',
    'CAN_VIEW_MANAGEMENT_DASHBOARD',
    'CAN_VIEW_SENSITIVE_DATA',
    'CAN_VIEW_STAFF',
  ],
  MD: [
    'CAN_VIEW_TEAM_DASHBOARD',
    'CAN_VIEW_BRANCH_DASHBOARD',
    'CAN_VIEW_MANAGEMENT_DASHBOARD',
    'CAN_REVIEW_WORKFLOW',
    'CAN_VIEW_SENSITIVE_DATA',
    'CAN_VIEW_STAFF',
  ],
  // BOARD: [
  //   'CAN_VIEW_TEAM_DASHBOARD',
  //   'CAN_VIEW_BRANCH_DASHBOARD',
  //   'CAN_VIEW_MANAGEMENT_DASHBOARD',
  //   'CAN_VIEW_BOARD_DASHBOARD',
  //   'CAN_VIEW_SENSITIVE_DATA',
  // ],
};

// ── UI feature gates (what each feature requires) ────────────────────────────
// Use these in components instead of hardcoding permission strings.

export const FEATURE_PERMISSIONS = {
  // Navigation
  NAV_ACCOUNT_OPENING:  'CAN_OPEN_ACCOUNT'              as Permission,
  NAV_WORKFLOW:         'CAN_REVIEW_WORKFLOW'            as Permission,
  NAV_LOANS:            'CAN_SUBMIT_LOAN'                as Permission,

  // Dashboard sections
  DASHBOARD_TEAM:       'CAN_VIEW_TEAM_DASHBOARD'        as Permission,
  DASHBOARD_BRANCH:     'CAN_VIEW_BRANCH_DASHBOARD'      as Permission,
  DASHBOARD_MANAGEMENT: 'CAN_VIEW_MANAGEMENT_DASHBOARD'  as Permission,
  DASHBOARD_BOARD:      'CAN_VIEW_BOARD_DASHBOARD'       as Permission,

  // Actions
  OPEN_ACCOUNT:         'CAN_OPEN_ACCOUNT'               as Permission,
  UPGRADE_ACCOUNT:      'CAN_UPGRADE_ACCOUNT'            as Permission,
  SUBMIT_LOAN:          'CAN_SUBMIT_LOAN'                as Permission,
  APPROVE_ACCOUNT:      'CAN_APPROVE_ACCOUNT'            as Permission,
  REVIEW_WORKFLOW:      'CAN_REVIEW_WORKFLOW'            as Permission,
  PLACE_LIEN:           'CAN_PLACE_LIEN'                 as Permission,

  // Sensitive data
  VIEW_SENSITIVE_DATA:  'CAN_VIEW_SENSITIVE_DATA'        as Permission,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function hasPermission(userPermissions: string[], permission: Permission): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.every((p) => userPermissions.includes(p));
}
