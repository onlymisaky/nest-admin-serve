import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: '用户名', example: 'test' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '昵称', example: 'test' })
  @IsString({ message: '昵称必须是字符串' })
  nickName: string;

  @ApiProperty({ description: '密码', example: 'test111' })
  @MinLength(6, { message: '密码长度不能小于6' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '邮箱', example: 'test@test.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}
