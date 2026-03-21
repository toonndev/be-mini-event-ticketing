import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../entities/User';

const userRepo = () => AppDataSource.getRepository(User);

export const findUserByEmail = (email: string) =>
  userRepo().findOne({ where: { email } });

export const findUserById = (id: string) =>
  userRepo().findOne({ where: { id } });

export const createUser = (data: { name: string; email: string; passwordHash: string }) =>
  userRepo().save(userRepo().create(data));

export const updateUserRole = async (id: string, role: UserRole) => {
  await userRepo().update(id, { role });
  return userRepo().findOne({ where: { id } });
};

export const findAllUsers = () =>
  userRepo().find({ order: { createdAt: 'DESC' }, select: ['id', 'name', 'email', 'role', 'createdAt'] });
