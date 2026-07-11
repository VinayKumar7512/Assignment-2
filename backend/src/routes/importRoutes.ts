import { Router } from 'express';
import { handleImport, handleCancelImport, handleHealthCheck } from '../controllers/importController';
import { upload } from '../middleware/upload';
import { importRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/health', handleHealthCheck);

router.post('/import', importRateLimiter, upload.single('file'), handleImport);

router.post('/import/cancel', handleCancelImport);

export default router;
