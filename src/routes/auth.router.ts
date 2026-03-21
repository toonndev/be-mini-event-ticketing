import { Router } from 'express';
import { register, login, promoteUser } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validate';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.post('/register', validateDto(RegisterDto), register);
router.post('/login', validateDto(LoginDto), login);
router.patch('/users/:id/role', authMiddleware, requireRole('admin'), promoteUser);

export default router;
