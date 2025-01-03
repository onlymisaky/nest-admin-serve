import { getConfig, getDefaultConfig, getEnv } from '@/config/configuration';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTHORIZATION_SERVICE } from './constants';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { CheckKitModule } from './modules/check-kit/check-kit.module';
import { CheckKitService } from './modules/check-kit/check-kit.service';
import { IAuthorizationService } from './types/authorization-service';

@Module({})
export class CoreModule {
  static forRoot({
    authorizationService,
  }: {
    authorizationService: Type<IAuthorizationService>
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
    ];
    if (authorizationService) {
      providers.push(
        {
          provide: AUTHORIZATION_SERVICE,
          useClass: authorizationService,
        },
        {
          provide: APP_GUARD,
          useClass: PermissionGuard,
        },
      );
    }

    const moduleMetadata: DynamicModule = {
      module: CoreModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [getDefaultConfig, getConfig],
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService, CheckKitService],
          useFactory: async (configService: ConfigService, checkKitService: CheckKitService) => {
            const mysqlCheck = await checkKitService.checkMysql();
            const type = mysqlCheck ? 'mysql' : 'sqlite' as 'mysql';
            return {
              type,
              autoLoadEntities: true,
              host: configService.get('mysql.host'),
              port: configService.get('mysql.port'),
              username: configService.get('mysql.user'),
              password: configService.get('mysql.password'),
              database: configService.get('mysql.database') + (mysqlCheck ? '' : '.db'),
              logging: configService.get('mysql.logging'),
              poolSize: configService.get('mysql.poolSize'),
              synchronize: getEnv() === 'production' ? false : configService.get('mysql.synchronize'),
              connectorPackage: configService.get('mysql.connectorPackage'),
            };
          },
        }),
        JwtModule.registerAsync({
          global: true,
          inject: [ConfigService],
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
      ],
      providers,
      exports: [],
    };
    return moduleMetadata;
  }
}
