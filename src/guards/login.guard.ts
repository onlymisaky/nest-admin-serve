import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PUBLIC_ROUTE } from '../constants';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.header('Authorization');
    if (!authorization) {
      throw new UnauthorizedException('no authorization');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('no token');
    }

    return this.jwtService.verifyAsync(token)
      .then((value) => {
        (request as any).user = value;
        return true;
      })
      .catch(() => {
        throw new UnauthorizedException('invalid token');
      });
  }
}
