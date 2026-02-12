import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
} from '../controllers/channelController';

const router = Router();

router.use(authenticateToken);

router.post('/', createChannel);
router.get('/:channelId', getChannelById);
router.put('/:channelId', updateChannel);
router.delete('/:channelId', deleteChannel);

export default router;
