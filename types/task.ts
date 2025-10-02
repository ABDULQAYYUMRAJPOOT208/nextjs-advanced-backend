// types/task.ts
export type Task = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

// Type for the real-time update message
export type TaskUpdateMessage = {
  type: 'TASK_CREATED' | 'TASK_COMPLETED';
  task: Task;
};