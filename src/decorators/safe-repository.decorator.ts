import { Repository } from 'typeorm';
import { RepositoryOperationException } from '../exceptions/repository-operation.exception';

export interface SafeRepositoryOptions {
  errorMessage?: string
  errorHandler?: (error: any) => void
  methods?: (keyof Repository<any>)[]
}

export function SafeRepository(options: SafeRepositoryOptions = {}) {
  return function (target: any, propertyKey: string) {
    let repositoryValue: any;

    Object.defineProperty(target, propertyKey, {
      get() {
        if (!repositoryValue) {
          return undefined;
        }

        return new Proxy(repositoryValue, {
          get(target, prop) {
            const method = target[prop as keyof Repository<any>];
            if (typeof method !== 'function') {
              return method;
            }
            if (options.methods && !options.methods.includes(prop as keyof Repository<any>)) {
              return method;
            }
            return async (...args: any[]) => {
              try {
                return await method.apply(target, args);
              }
              catch (error) {
                if (typeof options.errorHandler === 'function') {
                  options.errorHandler(error);
                }
                throw new RepositoryOperationException(error, options.errorMessage || `Failed to execute ${String(prop)}`);
              }
            };
          },
        });
      },
      set(value) {
        repositoryValue = value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
