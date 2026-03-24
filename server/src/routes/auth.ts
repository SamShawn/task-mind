import { Router } from 'express';
import {
  register,
  login,
  getMe,
  getUsers,
  logout
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, authorize('admin', 'manager'), getUsers);

export default router;
