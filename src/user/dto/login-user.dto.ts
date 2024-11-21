import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: '用户名', example: 'test' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'test111' })
  @MinLength(6, { message: '密码长度不能小于6' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
