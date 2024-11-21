import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicRoute } from '../decorators/public-route.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) { }

  @ApiOperation({ tags: ['用户'], summary: '注册用户' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: '注册成功' })
  @Post('register')
  @PublicRoute()
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);
    delete user.password;
    return user;
  }

  @ApiOperation({ tags: ['用户'], summary: '登录' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: '登录成功' })
  @Post('login')
  @PublicRoute()
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.login(loginUserDto);
    const token = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
    }).catch((error) => {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return {
      token,
    };
  }
}
