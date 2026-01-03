
import { getTodos } from './actions';
import AddTodoForm from '@/components/AddTodoForm';
import TodoList from '@/components/TodoList';

export default async function Page() {
  let todos = [];
  let error = null;

  try {
    todos = await getTodos();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch todos';
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Eat Log</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <AddTodoForm />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Your Todos ({todos.length})
          </h2>
          <TodoList todos={todos} />
        </div>
      </div>
    </div>
  );
}
