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
    can: (permission: Permission) => hasPermission(userPermissions, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userPermissions, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(userPermissions, permissions),

    // Navigation
    canOpenAccount:    hasPermission(userPermissions, FEATURE_PERMISSIONS.OPEN_ACCOUNT),
    canUpgradeAccount: hasPermission(userPermissions, FEATURE_PERMISSIONS.UPGRADE_ACCOUNT),
    canSubmitLoan:     hasPermission(userPermissions, FEATURE_PERMISSIONS.SUBMIT_LOAN),
    canReviewWorkflow: hasPermission(userPermissions, FEATURE_PERMISSIONS.REVIEW_WORKFLOW),
    canApproveAccount: hasPermission(userPermissions, FEATURE_PERMISSIONS.APPROVE_ACCOUNT),
    canPlaceLien:      hasPermission(userPermissions, FEATURE_PERMISSIONS.PLACE_LIEN),
    canViewSensitive:  hasPermission(userPermissions, FEATURE_PERMISSIONS.VIEW_SENSITIVE_DATA),

    // Dashboard tiers
    canViewTeamDashboard:       hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_TEAM),
    canViewBranchDashboard:     hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_BRANCH),
    canViewManagementDashboard: hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_MANAGEMENT),
    canViewBoardDashboard:      hasPermission(userPermissions, FEATURE_PERMISSIONS.DASHBOARD_BOARD),
    canViewStaff:               hasPermission(userPermissions, 'CAN_VIEW_STAFF' as Permission),
  };
}
