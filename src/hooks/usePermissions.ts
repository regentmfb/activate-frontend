'use client';

import { useAuthStore } from '@src/store/auth.store';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  FEATURE_PERMISSIONS,
} from '@src/constants/permissions';

function getPrimaryRole(hrmsRoles?: string[]): string | null {
  if (!hrmsRoles || hrmsRoles.length === 0) return null;
  
  // Priority: SUPER_ADMIN > MD > CMO > TEAM_LEAD > others
  if (hrmsRoles.includes('company')) return 'SUPER_ADMIN';
  if (hrmsRoles.includes('MD')) return 'MD';
  if (hrmsRoles.includes('CMO')) return 'CMO';
  if (hrmsRoles.includes('TEAM_LEAD')) return 'TEAM_LEAD';
  if (hrmsRoles.includes('OPERATIONS')) return 'OPERATIONS';
  if (hrmsRoles.includes('INTERNAL_CONTROL')) return 'INTERNAL_CONTROL';
  if (hrmsRoles.includes('RM')) return 'RM';
  if (hrmsRoles.includes('ACCOUNT_OFFICER')) return 'ACCOUNT_OFFICER';
  if (hrmsRoles.includes('TELLER')) return 'TELLER';
  
  return hrmsRoles[0]; // Default to first role
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const userPermissions = user?.permissions ?? [];
  const role = getPrimaryRole(user?.hrmsRoles);

  return {
    role,
    permissions: userPermissions,

    // Generic checks
    can: (permission: Permission) => role === 'SUPER_ADMIN' || hasPermission(userPermissions, permission),
    canAny: (permissions: Permission[]) => role === 'SUPER_ADMIN' || hasAnyPermission(userPermissions, permissions),
    canAll: (permissions: Permission[]) => role === 'SUPER_ADMIN' || hasAllPermissions(userPermissions, permissions),

    // Navigation
    canOpenAccount:    role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.OPEN_ACCOUNT),
    canUpgradeAccount: role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.UPGRADE_ACCOUNT),
    canSubmitLoan:     role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.SUBMIT_LOAN),
    canReviewWorkflow: role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.REVIEW_WORKFLOW),
    canApproveAccount: role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.APPROVE_ACCOUNT),
    canPlaceLien:      role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.PLACE_LIEN),
    canViewSensitive:  role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.VIEW_SENSITIVE_DATA),

    // Dashboard tiers
    canViewTeamDashboard:       role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_TEAM),
    canViewBranchDashboard:     role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_BRANCH),
    canViewManagementDashboard: role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_MANAGEMENT),
    canViewBoardDashboard:      role === 'SUPER_ADMIN' || hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_BOARD),
    canViewStaff:               role === 'SUPER_ADMIN' || hasPermission(userPermissions, 'CAN_VIEW_STAFF' as Permission),
  };
}
