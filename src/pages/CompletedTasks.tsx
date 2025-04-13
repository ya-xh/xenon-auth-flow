
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
}

export default function CompletedTasksPage() {
  const { toast } = useToast();
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    // Load todos from local storage
    const saved = localStorage.getItem('xenon_todos');
    const allTodos = saved ? JSON.parse(saved) : [];
    setCompletedTodos(allTodos.filter((todo: TodoItem) => todo.completed));
  }, []);

  const formatCompletionDate = (timestamp?: number) => {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const handleRestore = (id: string) => {
    // Get all todos
    const saved = localStorage.getItem('xenon_todos');
    const allTodos = saved ? JSON.parse(saved) : [];
    
    // Update the completed status
    const updatedTodos = allTodos.map((todo: TodoItem) => 
      todo.id === id ? { ...todo, completed: false, completedAt: undefined } : todo
    );
    
    // Save back to storage
    localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
    
    // Update the UI
    setCompletedTodos(updatedTodos.filter((todo: TodoItem) => todo.completed));
    
    toast({
      title: "Task restored",
      description: "Task has been moved back to your to-do list"
    });
  };

  const handleDelete = (id: string) => {
    // Get all todos
    const saved = localStorage.getItem('xenon_todos');
    const allTodos = saved ? JSON.parse(saved) : [];
    
    // Remove the todo
    const updatedTodos = allTodos.filter((todo: TodoItem) => todo.id !== id);
    
    // Save back to storage
    localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
    
    // Update the UI
    setCompletedTodos(updatedTodos.filter((todo: TodoItem) => todo.completed));
    
    toast({
      title: "Task deleted",
      description: "Task has been permanently removed"
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl text-purple-400 font-light mb-6">
          Completed Tasks
        </h1>
        
        {completedTodos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">You haven't completed any tasks yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {completedTodos.map(todo => (
              <li 
                key={todo.id} 
                className="flex flex-col p-3 rounded-md border border-gray-800 bg-gray-900/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{todo.text}</span>
                  <div className="flex space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleRestore(todo.id)}
                      className="h-8 w-8 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleDelete(todo.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Completed: {formatCompletionDate(todo.completedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
