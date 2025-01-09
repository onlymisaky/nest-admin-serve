import { Request } from 'express';

export interface IAuthorizationService {
  // 鉴权（Authentication）= 身份认证 = 你是谁 401
  // redirect to login page
  // validateUser?: <User>(username: string, password: string) => Promise<User>

  // 授权（Authorization）= 权限验证 = 你能做什么 403
  // redirect to 403 page
  getPermissions: (request: Request) => Promise<string[]>
}
