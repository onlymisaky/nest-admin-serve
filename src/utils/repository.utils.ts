import { Repository } from 'typeorm';
import { RepositoryOperationException } from '../exceptions/repository-operation.exception';

type TypeOrmRepositoryMethod<TEntity> = Repository<TEntity>[keyof Repository<TEntity>] & ((...args: any[]) => Promise<any>);

export async function executeTypeOrmRepositoryMethod<TEntity, TMethod extends TypeOrmRepositoryMethod<TEntity>>(
  method: TMethod,
  parameters: Parameters<TMethod>,
  errMsg?: string,
): Promise<ReturnType<TMethod>> {
  try {
    return await method(...parameters);
  }
  catch (error) {
    throw new RepositoryOperationException(error, errMsg || `Failed to execute ${String(method.name)}`);
  }
}
