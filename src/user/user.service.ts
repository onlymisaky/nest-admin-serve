import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeRepository } from '../decorators/safe-repository.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

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
    user.password = registerUserDto.password;
    user.email = registerUserDto.email;

    const existUser = await this.userRepository.findOne({ where: { username: user.username } });

    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    const newUser = await this.userRepository.save(user);
    delete newUser.password;
    return newUser;
  }
}
