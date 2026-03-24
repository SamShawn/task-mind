export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskCategory {
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  MARKETING = 'marketing',
  OPERATIONS = 'operations',
  CUSTOMER_SUPPORT = 'customer_support',
  RESEARCH = 'research',
  OTHER = 'other'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo?: User | null;
  createdBy: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface AIAnalysisResult {
  suggestedCategory: TaskCategory;
  suggestedPriority: TaskPriority;
  confidence: number;
  reasoning: string;
}
