import type { ReconnectOptions } from '../types';

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const defaultReconnectOptions: ReconnectOptions = {
  reconnectCount: 3,
  reconnectInterval: 1000,
  onConnectError: (err) => {
    throw err;
  },
};
