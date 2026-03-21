import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const signToken = (userId: string, role: UserRole) =>
  jwt.sign({ sub: userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as RegisterDto;

    const hasEmail = await authService.findUserByEmail(email);
    if (hasEmail) throw new AppError(MSG_MASTER.DUPLICATE_ENTRY, 'Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authService.createUser({ name, email, passwordHash });

    const token = signToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginDto;

    const user = await authService.findUserByEmail(email);
    if (!user) throw new AppError(MSG_MASTER.INVALID_AUTH_CREDENTIALS, 'Invalid credentials');

    const passwordVerify = await bcrypt.compare(password, user.passwordHash);
    if (!passwordVerify) throw new AppError(MSG_MASTER.INVALID_AUTH_CREDENTIALS, 'Invalid credentials');

    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const promoteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body as { role: UserRole };

    if (!['user', 'admin'].includes(role)) {
      throw new AppError(MSG_MASTER.INVALID_PARAMETERS, 'Role must be "user" or "admin"');
    }

    const target = await authService.findUserById(id);
    if (!target) throw new AppError(MSG_MASTER.NOT_FOUND, 'User not found');

    const updated = await authService.updateUserRole(id, role);
    res.json({ id: updated!.id, name: updated!.name, email: updated!.email, role: updated!.role });
  } catch (err) {
    next(err);
  }
};
