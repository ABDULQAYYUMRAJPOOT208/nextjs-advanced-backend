// app/page.tsx
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

// This is a modern Next.js Server Component
export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
        Full-Stack Advanced Task Manager 🚀
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Left Column: Form */}
        <div className="md:w-1/3">
          <TaskForm />
        </div>
        
        {/* Right Column: Task List */}
        <div className="md:w-2/3">
          <TaskList />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-xl text-sm text-gray-600">
        <h3 className="font-bold text-gray-800 mb-2">System Demonstration:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>**Caching:** Refresh the page. The first load hits the DB. Subsequent loads are instantly served from **Redis** (check Terminal 1 console).</li>
          <li>**Real-Time/PubSub:** Keep the page open. Create a new task in a *second browser window*. The first window updates instantly via **WebSockets/PubSub** (check Terminal 2 console).</li>
          <li>**Workers:** Click "Complete." The API immediately responds, and the **Worker** (Terminal 3) starts the 3-second email simulation.</li>
        </ul>
      </div>
    </main>
  );
}