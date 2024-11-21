import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE } from '../constants';

export function PublicRoute() {
  return SetMetadata(PUBLIC_ROUTE, true);
}
