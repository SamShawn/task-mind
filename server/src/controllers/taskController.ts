import { Request, Response } from 'express';
import Task from '../models/Task';
import AIClassifier from '../services/aiClassifier';

// Extend Request type to include userId
interface AuthenticatedRequest extends Request {
  userId: string;
}

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { title, description, dueDate, tags, estimatedHours, assignedTo } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: '请提供任务标题和描述'
      });
    }

    // AI智能分析任务
    const aiAnalysis = AIClassifier.analyzeTask(title, description, tags || []);

    const task = new Task({
      title,
      description,
      status: 'todo',
      priority: aiAnalysis.suggestedPriority,
      category: aiAnalysis.suggestedCategory,
      assignedTo: assignedTo || null,
      createdBy: userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      estimatedHours
    });

    await task.save();
    await task.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: {
        task,
        aiAnalysis
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: '创建任务失败'
    });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      createdBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query object with proper types
    type TaskQuery = {
      status?: string;
      priority?: string;
      category?: string;
      assignedTo?: string;
      createdBy?: string;
      $or?: Array<Record<string, any>>;
    };
    const query: TaskQuery = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;

    if (search) {
      const escapedSearch = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(escapedSearch, 'i')] } }
      ];
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit as string)),
      Task.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败'
    });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: '获取任务详情失败'
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    // 如果标题或描述被修改，重新进行AI分析
    if (updates.title || updates.description) {
      const aiAnalysis = AIClassifier.analyzeTask(
        updates.title || task.title,
        updates.description || task.description,
        updates.tags || task.tags
      );

      // 只有当用户没有手动设置分类和优先级时，才使用AI建议
      if (!updates.category && !updates.priority) {
        updates.category = aiAnalysis.suggestedCategory;
        updates.priority = aiAnalysis.suggestedPriority;
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (task as Record<string, unknown>)[key] = updates[key];
      }
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: '任务更新成功',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: '更新任务失败'
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({
      success: true,
      message: '任务删除成功'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: '删除任务失败'
    });
  }
};

export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const [byStatus, byPriority, byCategory] = await Promise.all([
      Task.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        byPriority,
        byCategory
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取任务统计失败'
    });
  }
};

export const analyzeTasks = async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供任务数组'
      });
    }

    const analyses = AIClassifier.analyzeBatch(tasks);

    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Analyze tasks error:', error);
    res.status(500).json({
      success: false,
      message: '任务分析失败'
    });
  }
};
