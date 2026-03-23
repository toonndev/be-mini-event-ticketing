import { Router } from 'express';
import { getEvents, getEventById, getCategories, createEvent, updateEvent, deleteEvent, liveEvent } from '../controllers/event.controller';
import { authMiddleware, optionalAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateDto } from '../middleware/validate';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';

const router = Router();

router.get('/', optionalAuth, getEvents);
router.get('/categories', getCategories);
router.get('/:id/live', liveEvent);
router.get('/:id', getEventById);
router.post('/', authMiddleware, requireRole('admin'), validateDto(CreateEventDto), createEvent);
router.patch('/:id', authMiddleware, requireRole('admin'), validateDto(UpdateEventDto), updateEvent);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteEvent);

export default router;
