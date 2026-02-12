import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getDirectMessages, sendDirectMessage, markAsRead } from '../controllers/dmController';

const router = Router();

router.use(authenticateToken);

router.get('/:userId', getDirectMessages);
router.post('/:userId', sendDirectMessage);
router.put('/:messageId/read', markAsRead);

export default router;
