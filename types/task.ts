export type Task = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskUpdateMessage = {
  type: 'TASK_CREATED' | 'TASK_COMPLETED';
  task: Task;
};