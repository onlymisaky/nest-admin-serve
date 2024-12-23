import { SafeService } from '@core/decorators/safe-service.decorator';
import { IAuthorizationService } from '@core/types/authorization-service';
import { Permission } from '@entities/permission.entity';
import { Role } from '@entities/role.entity';
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

  async initData() {
    const permissionUser = new Permission();
    permissionUser.name = 'user:*';
    permissionUser.description = '用户模块';

    const permissionUserCreate = new Permission();
    permissionUserCreate.name = 'user:create';
    permissionUserCreate.description = '创建用户';

    const permissionUserUpdate = new Permission();
    permissionUserUpdate.name = 'user:update';
    permissionUserUpdate.description = '更新用户';

    const permissionUserDelete = new Permission();
    permissionUserDelete.name = 'user:delete';
    permissionUserDelete.description = '删除用户';

    const permissionRole = new Permission();
    permissionRole.name = 'role:*';
    permissionRole.description = '角色模块';

    const permissionRoleCreate = new Permission();
    permissionRoleCreate.name = 'role:create';
    permissionRoleCreate.description = '创建角色';

    const permissionRoleUpdate = new Permission();
    permissionRoleUpdate.name = 'role:update';
    permissionRoleUpdate.description = '更新角色';

    const permissionRoleDelete = new Permission();
    permissionRoleDelete.name = 'role:delete';
    permissionRoleDelete.description = '删除角色';

    await this.entityManager.save(Permission, [
      permissionUser,
      permissionUserCreate,
      permissionUserUpdate,
      permissionUserDelete,
      permissionRole,
      permissionRoleCreate,
      permissionRoleUpdate,
      permissionRoleDelete,
    ]);

    const roleAdmin = new Role();
    roleAdmin.name = 'admin';
    roleAdmin.description = '超级管理员';
    roleAdmin.permissions = [permissionUser, permissionRole];

    const roleUser = new Role();
    roleUser.name = 'user';
    roleUser.description = '普通用户';
    roleUser.permissions = [permissionUser];

    await this.entityManager.save(Role, [roleAdmin, roleUser]);

    const userAdmin = new User();
    userAdmin.id = '3c34525c-470c-4164-b720-3ed4b6720589';
    userAdmin.username = 'admin';
    userAdmin.password = md5('123456');
    userAdmin.email = 'admin@email.com';
    userAdmin.roles = [roleAdmin];

    const user = new User();
    user.id = '5b43aa54-fb62-442f-8566-03f0ff162689';
    user.username = 'user';
    user.password = md5('123456');
    user.email = 'user@email.com';
    user.roles = [roleUser];

    return this.entityManager.save(User, [user, userAdmin]);
  }
}
