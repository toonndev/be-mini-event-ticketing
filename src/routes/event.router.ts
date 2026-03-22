import { Router } from 'express';
import { getEvents, getEventById, createEvent, liveEvent } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateDto } from '../middleware/validate';
import { CreateEventDto } from '../dto/event.dto';

const router = Router();

router.get('/', getEvents);
router.get('/:id/live', liveEvent);
router.get('/:id', getEventById);
router.post('/', authMiddleware, requireRole('admin'), validateDto(CreateEventDto), createEvent);

export default router;
