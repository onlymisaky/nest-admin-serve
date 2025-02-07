import { PublicRoute } from '@core/decorators/public-route.decorator';
import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) { }

  @ApiOperation({ tags: ['用户'], summary: '注册用户' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: '注册成功' })
  @PublicRoute()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);
    Reflect.deleteProperty(user, 'password');
    return user;
  }

  @ApiOperation({ tags: ['用户'], summary: '登录' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: '登录成功' })
  @PublicRoute()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.login(loginUserDto);
    // TODO Cache
    const payload = {
      id: user.id,
      username: user.username,
    };
    // 只把 jwt 当含有少量用户信息的 token 使用
    // @link https://juejin.cn/post/7391699424843710515
    const token = await this.jwtService.signAsync(payload).catch((error) => {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return {
      token,
    };
  }
}
