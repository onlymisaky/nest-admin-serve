import { DynamicModule, Module } from '@nestjs/common';
import { ListQueryService } from './service/list-query.service';

@Module({})
export class SharedModule {
  static forRoot(): DynamicModule {
    const moduleMetadata: DynamicModule = {
      global: true,
      module: SharedModule,
      providers: [
        ListQueryService,
      ],
      exports: [
        ListQueryService,
      ],
    };
    return moduleMetadata;
  }
}
