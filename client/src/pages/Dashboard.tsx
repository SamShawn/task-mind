import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTasks, useTaskStats, useAuth, useTaskAnalysis } from '../hooks';
import { TaskCard, TaskForm } from '../components';
import type { Task, TaskStatus, TaskPriority, TaskCategory, AIAnalysisResult } from '../types';
import {
  taskStatusLabels,
  taskPriorityLabels,
  taskCategoryLabels
} from '../utils/formatters';
import { Plus, Search, Filter, BarChart3, LogOut, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { tasks, loading, error, refetch, createTask, updateTask, deleteTask } = useTasks();
  const { stats, refetch: refetchStats } = useTaskStats();
  const { analyzeTask, loading: analyzing } = useTaskAnalysis();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [showStats, setShowStats] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI分析结果
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // 用于防抖的ref
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const analyzeTaskRef = useRef(analyzeTask);
  analyzeTaskRef.current = analyzeTask;

  // 实时分析任务（使用防抖）
  useEffect(() => {
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = setTimeout(async () => {
      if (showForm && !editingTask) {
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
        const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        const title = titleInput?.value || '';
        const description = descInput?.value || '';

        if (title.length >= 3 || description.length >= 10) {
          try {
            const analysis = await analyzeTaskRef.current(title, description);
            setAiAnalysis(analysis);
          } catch (err) {
            // 静默失败，不影响用户体验
            console.warn('AI分析失败:', err);
          }
        }
      }
    }, 800);

    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, [showForm, editingTask]);

  // Memoize filtered tasks to avoid recalculation on every render
  const filteredTasks = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return tasks.filter((task: Task) => {
      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));

      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory]);

  // Close modal with memoized callback
  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingTask(undefined);
    setAiAnalysis(null);
    setErrorMessage(null);
  }, []);

  // Show error message with memoized callback
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  }, []);

  // Handle task creation
  const handleCreate = useCallback(async (data: any) => {
    try {
      await createTask(data);
      closeForm();
      refetchStats();
    } catch (err: any) {
      showError(err.response?.data?.message || '创建任务失败');
    }
  }, [createTask, closeForm, refetchStats, showError]);

  // Handle task update
  const handleUpdate = useCallback(async (data: any) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask._id, data);
      closeForm();
      refetchStats();
    } catch (err: any) {
      showError(err.response?.data?.message || '更新任务失败');
    }
  }, [editingTask, updateTask, closeForm, refetchStats, showError]);

  // Handle task deletion
  const handleDelete = useCallback(async (task: Task) => {
    if (window.confirm('确定要删除这个任务吗?')) {
      try {
        await deleteTask(task._id);
        refetchStats();
      } catch (err: any) {
        showError(err.response?.data?.message || '删除任务失败');
      }
    }
  }, [deleteTask, refetchStats, showError]);

  // Handle task edit
  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  // Open create form
  const openCreateForm = useCallback(() => {
    setShowForm(true);
    setEditingTask(undefined);
    setAiAnalysis(null);
    setErrorMessage(null);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  // Toggle stats panel
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Task Mind
              </span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={toggleStats}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="查看统计"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="刷新"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="退出"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">任务统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-xs text-gray-500 mb-2">按状态</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.byStatus.map((item: { _id: string; count: number }) => (
                    <span key={item._id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {taskStatusLabels[item._id as TaskStatus] || item._id}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 mb-2">按优先级</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.byPriority.map((item: { _id: string; count: number }) => (
                    <span key={item._id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {taskPriorityLabels[item._id as TaskPriority] || item._id}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 mb-2">按分类</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.byCategory.map((item: { _id: string; count: number }) => (
                    <span key={item._id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {taskCategoryLabels[item._id as TaskCategory] || item._id}: {item.count}
                    </span>
                  ))}
                </div>
                           </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>筛选:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有状态</option>
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有优先级</option>
              {Object.entries(taskPriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有分类</option>
              {Object.entries(taskCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow"
            >
              <Plus className="h-4 w-4" />
              新建任务
            </button>
          </div>
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTask ? '编辑任务' : '创建任务'}
              </h2>
              <TaskForm
                task={editingTask}
                onSubmit={editingTask ? handleUpdate : handleCreate}
                onCancel={closeForm}
                aiAnalysis={aiAnalysis}
                isAnalyzing={analyzing}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {(error || errorMessage) && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMessage || error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-600 mb-4">点击"新建任务"开始创建您的第一个任务</p>
            <button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 mx-auto transition-all shadow-sm hover:shadow"
            >
              <Plus className="h-5 w-5" />
              创建任务
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task: Task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
