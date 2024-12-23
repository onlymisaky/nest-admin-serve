import { Request } from 'express';

// 授权（Authorization）= 权限验证 = 你能做什么 403
export interface IAuthorizationService {
  getPermissions: (request: Request) => Promise<string[]>
}
