import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMessages, createMessage, deleteMessage } from '../controllers/messageController';
import multer from 'multer';
import path from 'path';

const router = Router();
router.use(authenticateToken);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

router.get('/channel/:channelId', getMessages);
router.post('/channel/:channelId', upload.single('file'), createMessage);
router.delete('/:messageId', deleteMessage);

export default router;
