import { SetMetadata } from '@nestjs/common';
import { PERMISSION_ROUTE } from '../constants';

export type SinglePermission = string;
export type AndPermission = Record<string, boolean>;
export type OrSinglePermission = Array<SinglePermission>;
export type OrAndPermission = Array<AndPermission>;
export type OrPermission = Array<SinglePermission | AndPermission>;
export type Permission = SinglePermission | AndPermission | OrPermission | Array<Permission>;
/**
 * @param permission
 * @example
 * PermissionRoute('user:*');
 * PermissionRoute(['user:*', 'role:*']);
 * PermissionRoute({ 'user:*': true, 'role:*': true });
 * PermissionRoute(['user:*', { 'role:*': true, 'user:create': true }, ['user:update', 'user:delete']]);
 * PermissionRoute(['user:*', ['role:*', 'user:create', ['user:update', 'user:delete']]]);
 */
export function PermissionRoute(permission: Permission) {
  return SetMetadata(PERMISSION_ROUTE, permission);
}
