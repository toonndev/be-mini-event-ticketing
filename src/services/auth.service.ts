import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../entities/User';
import { cache } from '../utils/cache';

const userRepo = () => AppDataSource.getRepository(User);

const CACHE_TTL = 60; // seconds

export const findUserByEmail = (email: string) =>
  userRepo().findOne({ where: { email } });

export const findUserById = (id: string) =>
  userRepo().findOne({ where: { id } });

export const createUser = async (data: { name: string; email: string; passwordHash: string }): Promise<User> => {
  const user = await userRepo().save(userRepo().create(data));
  cache.delByPrefix('users:list:');
  return user;
};

export const updateUserRole = async (id: string, role: UserRole): Promise<User | null> => {
  await userRepo().update(id, { role });
  cache.delByPrefix('users:list:');
  return userRepo().findOne({ where: { id } });
};

export const findAllUsers = async (skip: number, take: number): Promise<[User[], number]> => {
  const key = `users:list:${skip}:${take}`;
  const cached = cache.get<[User[], number]>(key);
  if (cached) return cached;

  const result = await userRepo().findAndCount({
    order: { createdAt: 'DESC' },
    select: ['id', 'name', 'email', 'role', 'createdAt'],
    skip,
    take,
  });
  cache.set(key, result, CACHE_TTL);
  return result;
};
