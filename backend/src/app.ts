import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import importRoutes from './routes/importRoutes';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Import-Id', 'X-Row-Count', 'X-Estimated-Time'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(generalRateLimiter);

app.use('/api', importRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

export default app;
