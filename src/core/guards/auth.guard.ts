import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PUBLIC_ROUTE } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.header('Authorization');
    if (!authorization) {
      throw new UnauthorizedException('未登录');
    }

    if (!authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('认证格式错误');
    }

    const token = authorization.slice(7);
    if (!token) {
      throw new UnauthorizedException('Token不存在');
    }

    return this.jwtService.verifyAsync(token)
      .then((value) => {
        // 将解析出的用户信息挂载到请求对象上
        // PermissionGuard 会用到
        request.user = value;
        return true;
      })
      .catch(() => {
        throw new UnauthorizedException('Token已过期');
      });
  }
}
