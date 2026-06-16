'use client';

import { usePermissions } from '@src/hooks/usePermissions';
import { Permission } from '@src/constants/permissions';

type Props = {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Renders children only if the user has the required permission(s).
 *
 * Usage:
 *   <PermissionGate permission="CAN_OPEN_ACCOUNT">
 *     <OpenAccountButton />
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={['CAN_APPROVE_ACCOUNT', 'CAN_REVIEW_WORKFLOW']}>
 *     <WorkflowPanel />
 *   </PermissionGate>
 *
 *   <PermissionGate permission="CAN_OPEN_ACCOUNT" fallback={<p>No access</p>}>
 *     <AccountOpeningForm />
 *   </PermissionGate>
 */
export function PermissionGate({ permission, anyOf, allOf, fallback = null, children }: Props) {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;

  if (permission) allowed = can(permission);
  else if (anyOf) allowed = canAny(anyOf);
  else if (allOf) allowed = canAll(allOf);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
