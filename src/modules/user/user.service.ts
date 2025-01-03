import { SafeService } from '@core/decorators/safe-service.decorator';
import { IAuthorizationService } from '@core/types/authorization-service';
import { Permission } from '@entities/permission.entity';
import { User } from '@entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { md5 } from '@shared/utils';
import { Request } from 'express';
import { EntityManager } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService implements IAuthorizationService {
  @SafeService({
    errorHandler(_error, { prop }) {
      throw new HttpException(`Failed to execute ${String(prop)}`, HttpStatus.UNPROCESSABLE_ENTITY);
    },
  })
  @InjectEntityManager()
  private readonly entityManager: EntityManager;

  async register(registerUserDto: RegisterUserDto) {
    const user = new User();
    user.username = registerUserDto.username;
    user.nickName = registerUserDto.nickName;
    user.password = md5(registerUserDto.password);
    user.email = registerUserDto.email;

    const existUser = await this.entityManager.findOne(User, { where: { username: user.username } });

    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    const newUser = await this.entityManager.save(User, user);

    return newUser;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.entityManager.findOne(User, {
      where: {
        username: loginUserDto.username,
        password: md5(loginUserDto.password),
      },
    });

    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async getPermissions(request: Request): Promise<string[]> {
    const user = request.user as User;
    const permissions = await this.getPermissionsByUser(user);
    return permissions.map((p) => p.name);
  }

  async getPermissionsByUser(user: Pick<User, 'id' | 'username'>): Promise<Permission[]> {
    const _user = await this.entityManager.findOne(User, {
      where: { id: user.id, username: user.username },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });
    if (!_user || !_user.roles) {
      return [];
    }
    return _user.roles.reduce((acc, role) => {
      const permissions = role.permissions;
      return [...acc, ...permissions];
    }, []);
  }
}
