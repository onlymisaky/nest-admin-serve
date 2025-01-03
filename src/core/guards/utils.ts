import { AndPermission, OrAndPermission, Permission } from '../decorators/permission-route.decorator';

export function flattenPermission(routePermission: Permission): OrAndPermission {
  if (typeof routePermission === 'string') {
    return [{ [routePermission]: true }];
  }
  if (Object.prototype.toString.call(routePermission) === '[object Object]') {
    const andPermission: AndPermission = {};
    Object.keys(routePermission).forEach((key) => {
      if (typeof routePermission[key] === 'boolean') {
        andPermission[key] = routePermission[key];
      }
    });
    return [andPermission];
  }
  if (Array.isArray(routePermission)) {
    const result: OrAndPermission = [];
    routePermission.forEach((p) => {
      result.push(...flattenPermission(p));
    });
    return result;
  }
  return [];
}

export function resolveAndPermission(permission: AndPermission, userPermissions: string[]): boolean {
  const result: boolean[] = [];
  for (const key in permission) {
    if (userPermissions.includes(key)) {
      if (permission[key]) {
        result.push(true);
      }
      else {
        result.push(false);
      }
    }
    else {
      result.push(false);
    }
  }
  if (result.length === 0) {
    return false;
  }
  if (result.includes(false)) {
    return false;
  }
  return true;
}

export function checkPermission(routePermission: Permission, userPermissions: string[]): boolean {
  const permissions = flattenPermission(routePermission);
  for (const permission of permissions) {
    if (resolveAndPermission(permission, userPermissions)) {
      return true;
    }
  }
  return false;
}
