import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import type { Task, AIAnalysisResult } from '../types';

export const useTasks = (filters?: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getTasks(filters);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取任务失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    title: string;
    description: string;
    dueDate?: string;
    tags?: string[];
    estimatedHours?: number;
    assignedTo?: string;
  }) => {
    const response = await taskAPI.createTask(data);
    await fetchTasks();
    return response;
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const response = await taskAPI.updateTask(id, data);
    await fetchTasks();
    return response;
  };

  const deleteTask = async (id: string) => {
    await taskAPI.deleteTask(id);
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
};

export const useTaskStats = () => {
  const [stats, setStats] = useState<{
    byStatus: Array<{ _id: string; count: number }>;
    byPriority: Array<{ _id: string; count: number }>;
    byCategory: Array<{ _id: string; count: number }>;
  } | null>(null);

  const fetchStats = async () => {
    try {
      const response = await taskAPI.getTaskStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, refetch: fetchStats };
};

export const useTaskAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const analyzeTask = async (
    title: string,
    description: string,
    tags?: string[]
  ): Promise<AIAnalysisResult> => {
    setLoading(true);
    try {
      const response = await taskAPI.analyzeTasks([{ title, description, tags }]);
      return response[0];
    } finally {
      setLoading(false);
    }
  };

  return { analyzeTask, loading };
};
