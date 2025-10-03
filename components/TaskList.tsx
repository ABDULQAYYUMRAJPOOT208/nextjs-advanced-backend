'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { socket } from '@/utils/scoket'; 
import { Task, TaskUpdateMessage } from '@/types/task';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Task[]>('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleTaskUpdate = (message: TaskUpdateMessage) => {
      console.log('Real-Time Update Received:', message);
      
      if (message.type === 'TASK_CREATED') {
        setTasks(prev => {
          if (prev.some(task => task.id === message.task.id)) {
            return prev;
          }
          return [message.task, ...prev];
        });
      }
    };

    socket.on('taskUpdated', handleTaskUpdate);

    return () => {
      socket.off('taskUpdated', handleTaskUpdate);
    };
  }, []); 

  const handleComplete = async (id: string) => {
    try {
      await axios.post(`/api/tasks/${id}/complete`);
      alert('Task completion triggered! Check worker console for 3-second email simulation.');
      
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: true } : t));
    } catch (error) {
      console.error('Failed to complete task:', error);
      // fetchTasks(); 
    }
  };

  if (isLoading) return <div className="p-8 text-center text-lg">Loading tasks...</div>;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task List ({tasks.length})</h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-xl shadow-md flex justify-between items-center transition duration-200 ${
              task.isCompleted ? 'bg-green-100 opacity-70' : 'bg-white hover:shadow-lg'
            }`}
          >
            <div>
              <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">ID: {task.id.substring(0, 8)}...</p>
            </div>
            {!task.isCompleted && (
              <button
                onClick={() => handleComplete(task.id)}
                className="ml-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Complete
              </button>
            )}
            {task.isCompleted && (
                <span className="ml-4 px-3 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">
                    Completed
                </span>
            )}
          </li>
        ))}
        {tasks.length === 0 && <p className="text-gray-500 text-center">No tasks yet! Add one above.</p>}
      </ul>
    </div>
  );
}