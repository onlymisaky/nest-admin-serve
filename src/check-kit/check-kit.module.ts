import { Global, Module } from '@nestjs/common';
import { CheckKitService } from './check-kit.service';

@Global()
@Module({
  providers: [CheckKitService],
  exports: [CheckKitService],
})
export class CheckKitModule { }
