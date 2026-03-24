import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'taskmind_jwt_secret_key_development';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供姓名、邮箱和密码'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || UserRole.MEMBER,
      department
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    void _req; // Prevent unused variable warning
    const users = await User.find().sort({ name: 1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // 在实际应用中，这里可能会：
    // 1. 将JWT添加到黑名单（如果使用Redis等）
    // 2. 更新用户的最后登出时间
    // 3. 清除服务器端的会话数据

    const userId = (req as any).userId;
    if (userId) {
      // 记录用户登出时间
      await User.findByIdAndUpdate(userId, {
        lastLogout: new Date()
      });
    }

    res.json({
      success: true,
      message: '退出成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // 即使服务器端出错，客户端仍然可以清除本地token
    res.status(500).json({
      success: false,
      message: '退出失败，但已清除本地登录信息'
    });
  }
};
