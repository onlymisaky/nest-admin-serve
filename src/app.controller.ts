import { Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { PermissionRoute } from './decorators/permission-route.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @PermissionRoute(['user:*', 'role:*'])
  @Get('test')
  test() {
    return 'Get test, need user or role permission';
  }

  @PermissionRoute({ 'user:*': true, 'role:*': true })
  @Post('test')
  test2() {
    return 'Post test, need user and role permission';
  }

  @PermissionRoute('user:*')
  @Put('test')
  test3() {
    return 'Put test, need user permission';
  }
}
