import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import authRouter from './routes/auth.router';
import eventRouter from './routes/event.router';
import bookingRouter from './routes/booking.router';
import adminRouter from './routes/admin.router';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import { AppError } from './types';
import { MSG_MASTER } from './message/msg-master';

const app = express();

app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError(MSG_MASTER.INVALID_ACCESS_RIGHTS, `CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

export default app;
