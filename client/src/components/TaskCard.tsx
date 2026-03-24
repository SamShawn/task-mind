import type { Task } from '../types';
import {
  formatDate,
  taskStatusLabels,
  taskPriorityLabels,
  taskCategoryLabels,
  taskStatusColors,
  taskPriorityColors,
  taskCategoryColors
} from '../utils/formatters';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            删除
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColors[task.status]}`}>
          {taskStatusLabels[task.status]}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskPriorityColors[task.priority]}`}>
          {taskPriorityLabels[task.priority]}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskCategoryColors[task.category]}`}>
          {taskCategoryLabels[task.category]}
        </span>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>创建者: {task.createdBy.name}</span>
        {task.dueDate && (
          <span>截止: {formatDate(task.dueDate, 'MM-dd')}</span>
        )}
      </div>
    </div>
  );
};
