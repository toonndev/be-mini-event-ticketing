import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import * as authService from '../services/auth.service';
import * as bookingService from '../services/booking.service';
import * as eventService from '../services/event.service';
import { AppError } from '../types';
import { MSG_MASTER } from '../message/msg-master';
import { parsePagination, buildPaginationMeta, setContentRange } from '../utils/pagination';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const paging = parsePagination(req);
    const [users, total] = await authService.findAllUsers(paging.skip, paging.limit);
    setContentRange(res, total, paging, users.length);
    res.json({
      data: users,
      pagination: buildPaginationMeta(total, paging),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/events/:id/bookings', async (req, res, next) => {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) throw new AppError(MSG_MASTER.NOT_FOUND, 'Event not found');

    const paging = parsePagination(req);
    const [bookings, total] = await bookingService.findBookingsByEvent(req.params.id, paging.skip, paging.limit);
    const result = bookings.map((b) => ({
      bookingId: b.id,
      quantity: b.quantity,
      bookedAt: b.bookedAt,
      user: {
        id: b.user.id,
        name: b.user.name,
        email: b.user.email,
      },
    }));
    setContentRange(res, total, paging, result.length);
    res.json({
      data: result,
      pagination: buildPaginationMeta(total, paging),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
