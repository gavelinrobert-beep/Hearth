import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUsers, getUserById, updateUser } from '../controllers/userController';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.put('/:userId', updateUser);

export default router;
