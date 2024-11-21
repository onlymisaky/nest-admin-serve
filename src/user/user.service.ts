import * as crypto from 'node:crypto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeRepository } from '../decorators/safe-repository.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

@Injectable()
export class UserService {
  @InjectRepository(User)
  @SafeRepository({
    errorHandler: (error) => {
      new Logger(UserService.name).error(error);
    },
  })
  private userRepository: Repository<User>;

  async register(registerUserDto: RegisterUserDto) {
    const user = new User();
    user.username = registerUserDto.username;
    user.nickName = registerUserDto.nickName;
    user.password = md5(registerUserDto.password);
    user.email = registerUserDto.email;

    const existUser = await this.userRepository.findOne({ where: { username: user.username } });

    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    const newUser = await this.userRepository.save(user);

    return newUser;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
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
}
