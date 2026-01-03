'use client';

import { createTodo } from '@/app/actions';
import { useState } from 'react';

export default function AddTodoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createTodo(formData);
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter todo title"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter todo description (optional)"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Adding...' : 'Add Todo'}
        </button>
      </div>
    </form>
  );
}