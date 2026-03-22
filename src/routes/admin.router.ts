import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import * as authService from '../services/auth.service';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await authService.findAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
