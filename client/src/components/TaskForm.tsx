import { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, TaskCategory, AIAnalysisResult } from '../types';
import {
  taskStatusLabels,
  taskPriorityLabels,
  taskCategoryLabels,
  taskStatusColors,
  taskPriorityColors,
  taskCategoryColors
} from '../utils/formatters';
import { Lightbulb, Loader2 } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  aiAnalysis?: AIAnalysisResult | null;
  isAnalyzing?: boolean;
}

export const TaskForm = ({ task, onSubmit, onCancel, aiAnalysis, isAnalyzing }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || ('todo' as TaskStatus),
    priority: task?.priority || undefined,
    category: task?.category || undefined,
    dueDate: task?.dueDate?.split('T')[0] || '',
    tags: task?.tags?.join(', ') || '',
    estimatedHours: task?.estimatedHours || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined
    };

    if (!formData.priority && aiAnalysis) {
      data.priority = aiAnalysis.suggestedPriority;
    }
    if (!formData.category && aiAnalysis) {
      data.category = aiAnalysis.suggestedCategory;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
          <Loader2 className="animate-spin h-4 w-4" />
          AI正在分析任务...
        </div>
      )}

      {aiAnalysis && !isAnalyzing && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0" />
            <span className="font-medium text-purple-900">AI智能建议</span>
          </div>
          <div className="text-sm text-gray-700 mb-3">{aiAnalysis.reasoning}</div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskCategoryColors[aiAnalysis.suggestedCategory]}`}>
              分类: {taskCategoryLabels[aiAnalysis.suggestedCategory]}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskPriorityColors[aiAnalysis.suggestedPriority]}`}>
              优先级: {taskPriorityLabels[aiAnalysis.suggestedPriority]}
            </span>
            <span className="text-xs text-gray-600 px-2 py-1">
              置信度: {Math.round(aiAnalysis.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(taskStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select
            name="priority"
            value={formData.priority || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">自动(AI)</option>
            {Object.entries(taskPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">自动(AI)</option>
            {Object.entries(taskCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">预估工时</label>
          <input
            type="number"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="例如: 前端, 优化, 重要"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {task ? '更新任务' : '创建任务'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          取消
        </button>
      </div>
    </form>
  );
};
