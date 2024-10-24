export interface BaseRepository<T> {
  create(entity: T): Promise<void>;
  findOneById(id: string): Promise<T | undefined>; 
}