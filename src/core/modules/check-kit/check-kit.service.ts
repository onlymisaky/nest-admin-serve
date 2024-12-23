import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class CheckKitService {
  @Inject(ConfigService)
  private configService: ConfigService;

  async checkMysql() {
    return mysql.createConnection({
      host: this.configService.get('mysql.host'),
      port: this.configService.get('mysql.port'),
      user: this.configService.get('mysql.user'),
      password: this.configService.get('mysql.password'),
    }).then((connection) => {
      connection.destroy();
      return true;
    }).catch(() => {
      return false;
    });
  }
}
