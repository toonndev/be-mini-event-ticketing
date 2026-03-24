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
  cache.del('users:list');
  return user;
};

export const updateUserRole = async (id: string, role: UserRole): Promise<User | null> => {
  await userRepo().update(id, { role });
  cache.del('users:list');
  return userRepo().findOne({ where: { id } });
};

export const findAllUsers = async (): Promise<User[]> => {
  const cached = cache.get<User[]>('users:list');
  if (cached) return cached;

  const users = await userRepo().find({ order: { createdAt: 'DESC' }, select: ['id', 'name', 'email', 'role', 'createdAt'] });
  cache.set('users:list', users, CACHE_TTL);
  return users;
};
