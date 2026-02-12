import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createServer,
  getServers,
  getServerById,
  updateServer,
  deleteServer,
  joinServer,
  leaveServer,
} from '../controllers/serverController';

const router = Router();

router.use(authenticateToken);

router.post('/', createServer);
router.get('/', getServers);
router.get('/:serverId', getServerById);
router.put('/:serverId', updateServer);
router.delete('/:serverId', deleteServer);
router.post('/:serverId/join', joinServer);
router.post('/:serverId/leave', leaveServer);

export default router;
