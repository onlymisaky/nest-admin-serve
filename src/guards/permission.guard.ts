import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { PERMISSION_ROUTE, PUBLIC_ROUTE } from '../constants';
import { AndPermission, OrAndPermission, Permission } from '../decorators/permission-route.decorator';

function flattenPermission(routePermission: Permission): OrAndPermission {
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

function resolveAndPermission(permission: AndPermission, userPermissions: string[]): boolean {
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

function checkPermission(routePermission: Permission, userPermissions: string[]): boolean {
  const permissions = flattenPermission(routePermission);
  for (const permission of permissions) {
    if (resolveAndPermission(permission, userPermissions)) {
      return true;
    }
  }
  return false;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(UserService)
  private readonly userService: UserService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO:
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE, context.getHandler());
    if (isPublic) {
      return true;
    }

    const routePermission = this.reflector.get<Permission>(PERMISSION_ROUTE, context.getHandler());

    if (!routePermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    const userPermissions = await this.userService.getPermissions(user);
    if (userPermissions.length === 0) {
      throw new UnauthorizedException('权限不足');
    }
    const permissionNames = userPermissions.map((p) => p.name);

    if (checkPermission(routePermission, permissionNames)) {
      return true;
    }

    throw new UnauthorizedException('权限不足');
  }
}
