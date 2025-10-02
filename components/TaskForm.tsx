// components/TaskForm.tsx
'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/types/task';
import { useState } from 'react';

// 1. Zod Schema: Defines the structure and validation rules
const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema), // Connects Zod to React Hook Form
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // 2. API Call (POST /api/tasks)
      const response = await axios.post<Task>('/api/tasks', data);
      
      console.log('Task created successfully:', response.data);
      alert('Task Created! Check the console for the backend Pub/Sub notification.');
      
      reset(); // Reset form on success
      
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Error creating task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-lg w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title Input */}
        <div>
          <input
            {...register('title')}
            placeholder="Task Title (e.g., Implement Caching Layer)"
            className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        
        {/* Description Input */}
        <div>
          <textarea
            {...register('description')}
            placeholder="Detailed description (Optional)"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-150 disabled:bg-blue-400"
        >
          {isSubmitting ? 'Adding Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}