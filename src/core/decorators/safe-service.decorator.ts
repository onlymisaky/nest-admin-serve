export interface SafeServiceOptions<S extends Record<string, any>, Cls> {
  errorHandler?: (
    error: any,
    { ins, service, prop, method, args }: {
      ins: Cls
      service: S
      prop: keyof S
      method: S[keyof S]
      args: Parameters<S[keyof S]>
    }
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

            return async (...args: Parameters<S[keyof S]>) => {
              try {
                return await method.apply(target, args);
              }
              catch (error) {
                if (typeof options.errorHandler === 'function') {
                  return options.errorHandler(error, {
                    ins: classInstance,
                    service,
                    prop,
                    method,
                    args,
                  });
                }
                else {
                  return Promise.reject(error);
                }
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
