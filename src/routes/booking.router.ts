import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/booking.controller';
import { validateDto } from '../middleware/validate';
import { CreateBookingDto } from '../dto/booking.dto';

const router = Router();

router.use(authMiddleware);

router.post('/', validateDto(CreateBookingDto), createBooking);
router.get('/me', getMyBookings);
router.delete('/:id', cancelBooking);

export default router;
