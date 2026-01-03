'use client';

import { deleteTodo, updateTodo } from '@/app/actions';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  created_at?: string;
}

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  async function handleToggleComplete(id: string, completed: boolean) {
    try {
      await updateTodo(id, !completed);
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo');
    }
  }

  if (todos.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No todos found. Create your first todo!
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
            todo.completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleComplete(todo.id, todo.completed || false)}
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                todo.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {todo.completed && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-lg ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {todo.description}
                </p>
              )}
              {todo.created_at && (
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(todo.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className="flex-shrink-0 px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
