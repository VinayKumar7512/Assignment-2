import rateLimit from 'express-rate-limit';

export const importRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Too many import requests. Please wait a minute before trying again.',
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
  },
});
