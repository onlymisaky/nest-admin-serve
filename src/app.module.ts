import { CoreModule } from '@core/core.module';
import { UserModule } from '@modules/user/user.module';
import { UserService } from '@modules/user/user.service';
import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './modules/domain/domain.module';

@Module({
  imports: [
    CoreModule.forRoot({
      authorizationService: UserService,
    }),
    SharedModule.forRoot(),
    UserModule,
    DomainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
