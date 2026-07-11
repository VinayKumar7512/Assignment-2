import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../types';

const ALLOWED_MIMETYPES = [
  'text/csv',
  'text/plain',
  'application/csv',
  'application/vnd.ms-excel',
  'application/octet-stream',
];

const ALLOWED_EXTENSIONS = ['.csv'];

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new AppError(`Unsupported file type: ${ext}. Only .csv files are accepted.`, 400));
    return;
  }

  if (!ALLOWED_MIMETYPES.includes(file.mimetype) && ext !== '.csv') {
    cb(new AppError(`Unsupported MIME type: ${file.mimetype}.`, 400));
    return;
  }

  file.filename = `${uuidv4()}${ext}`;
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});
