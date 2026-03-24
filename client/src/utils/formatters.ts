import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TaskStatus, TaskPriority, TaskCategory } from '../types';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd HH:mm') => {
  return format(new Date(date), formatStr, { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
};

export const taskCategoryLabels: Record<TaskCategory, string> = {
  development: '开发',
  design: '设计',
  marketing: '营销',
  operations: '运维',
  customer_support: '客户支持',
  research: '研究',
  other: '其他'
};

export const taskStatusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export const taskCategoryColors: Record<TaskCategory, string> = {
  development: 'bg-purple-100 text-purple-800',
  design: 'bg-pink-100 text-pink-800',
  marketing: 'bg-cyan-100 text-cyan-800',
  operations: 'bg-indigo-100 text-indigo-800',
  customer_support: 'bg-amber-100 text-amber-800',
  research: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800'
};
