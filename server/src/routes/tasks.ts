import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
  analyzeTasks
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.get('/stats', authenticate, getTaskStats);
router.post('/analyze', authenticate, analyzeTasks);
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;
