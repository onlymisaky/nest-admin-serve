import { InternalServerErrorException } from '@nestjs/common';

function handleError<S extends Record<string, any>, Cls>(
  error: any,
  options: SafeServiceOptions<S, Cls>,
  classInstance: Cls,
  service: S,
  prop: keyof S,
  method: S[keyof S],
  args: Parameters<S[keyof S]>,
) {
  if (typeof options.errorHandler === 'function') {
    return options.errorHandler(error, {
      ins: classInstance,
      service,
      prop,
      method,
      args,
    });
  }
  throw new InternalServerErrorException(error);
}

export interface SafeServiceOptions<S extends Record<string, any>, Cls> {
  errorHandler?: (
    error: any,
    { ins, service, prop, method, args }: {
      ins: Cls
      service: S
      prop: keyof S
      method: S[keyof S]
      args: Parameters<S[keyof S]>
    },
  ) => any
  methods?: (keyof S)[]
}

export function SafeService<S extends Record<string, any>, Cls>(options: SafeServiceOptions<S, Cls> = {}) {
  return function (classInstance: Cls, propertyKey: string) {
    let service: S;

    Object.defineProperty(classInstance, propertyKey, {
      get() {
        if (!service) {
          return undefined;
        }

        return new Proxy(service, {
          get(target, p) {
            const prop = p as keyof S;
            const method = target[prop];

            if (typeof method !== 'function') {
              return method;
            }

            if (options.methods && !options.methods.includes(prop)) {
              return method;
            }

            return (...args: Parameters<S[keyof S]>) => {
              try {
                const result = method.apply(target, args);
                if (result instanceof Promise) {
                  return result.catch((error) => {
                    handleError(error, options, classInstance, service, prop, method, args);
                  });
                }
                return result;
              }
              catch (error) {
                handleError(error, options, classInstance, service, prop, method, args);
              }
            };
          },
        });
      },
      set(value) {
        service = value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
