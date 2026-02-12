import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig, getDefaultConfig } from '@/config/configuration';
import { AUTHORIZATION_SERVICE } from './constants';
import { createTypeOrmOptions } from './database/typeorm.factory';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RedisModule } from './modules/redis/redis.module';
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
        RedisModule.register({
          isGlobal: true,
          connectorPackage: 'cache-manager',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const host = configService.get('redis.host') as string;
            const port = configService.get('redis.port') as number;
            const database = configService.get('redis.database') as number;
            // TODO: 类型提示需要完善
            return {
              port,
              host,
              db: database,

              socket: {
                host,
                port,
              },
              database,
            };
          },
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return await createTypeOrmOptions(configService);
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
      ],
      providers,
      exports: [],
    };
    return moduleMetadata;
  }
}
