import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckKitModule } from './check-kit/check-kit.module';
import { CheckKitService } from './check-kit/check-kit.service';
import { getConfig, getDefaultConfig, getEnv } from './config/configuration';
import { LoginGuard } from './guards/login.guard';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [getDefaultConfig, getConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, CheckKitService],
      // @ts-expect-error @ts-ignore
      useFactory: async (configService: ConfigService, checkKitService: CheckKitService) => {
        const mysqlCheck = await checkKitService.checkMysql();
        return {
          type: mysqlCheck ? 'mysql' : 'sqlite',
          entities: [
            // eslint-disable-next-line node/no-path-concat
            `${__dirname}/**/*.entity{.ts,.js}`,
          ],
          host: configService.get('mysql.host'),
          port: configService.get('mysql.port'),
          username: configService.get('mysql.user'),
          password: configService.get('mysql.password'),
          database: configService.get('mysql.database') + (mysqlCheck ? '' : '.db'),
          logging: configService.get('mysql.logging'),
          poolSize: configService.get('mysql.poolSize'),
          synchronize: getEnv() === 'production' ? true : configService.get('mysql.synchronize'),
          connectorPackage: configService.get('mysql.connectorPackage'),
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        return {
          global: configService.get('jwt.global'),
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn'),
          },
        };
      },
    }),
    CheckKitModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
  ],
})
export class AppModule { }
