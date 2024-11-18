import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getConfig, getDefaultConfig } from './config/configuration';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [getDefaultConfig, getConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          entities: [User],
          host: configService.get('mysql.host'),
          port: configService.get('mysql.port'),
          username: configService.get('mysql.user'),
          password: configService.get('mysql.password'),
          database: configService.get('mysql.database'),
          logging: configService.get('mysql.logging'),
          poolSize: configService.get('mysql.poolSize'),
          synchronize: configService.get('mysql.synchronize'),
          connectorPackage: configService.get('mysql.connectorPackage'),
        };
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
