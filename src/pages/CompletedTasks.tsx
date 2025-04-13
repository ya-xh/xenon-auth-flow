
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string;
  user_id?: string;
}

export default function CompletedTasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load completed todos
  useEffect(() => {
    const loadCompletedTodos = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          // Fetch completed todos from Supabase
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('completed_at', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            setCompletedTodos(data as TodoItem[]);
          }
        } else {
          // Load from localStorage for guest users
          const saved = localStorage.getItem('xenon_completed_todos');
          if (saved) {
            setCompletedTodos(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error("Error loading completed todos:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your completed tasks"
        });
        
        // Fallback to localStorage
        const saved = localStorage.getItem('xenon_completed_todos');
        if (saved) {
          setCompletedTodos(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCompletedTodos();
  }, [user, toast]);

  // Delete all completed tasks
  const deleteAllCompleted = async () => {
    if (completedTodos.length === 0) return;
    
    setIsDeleting(true);
    
    try {
      if (user) {
        // Delete from Supabase
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (error) throw error;
      }
      
      // Update local state
      setCompletedTodos([]);
      localStorage.removeItem('xenon_completed_todos');
      
      toast({
        title: "Completed tasks cleared",
        description: "All completed tasks have been removed"
      });
      
    } catch (error) {
      console.error("Error deleting completed tasks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear completed tasks"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore a completed task
  const restoreTask = async (id: string) => {
    try {
      if (user) {
        // Update in Supabase
        const { error } = await supabase
          .from('todos')
          .update({ completed: false, completed_at: null })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Update local state
      const updatedTodos = completedTodos.filter(todo => todo.id !== id);
      setCompletedTodos(updatedTodos);
      
      if (!user) {
        // For guest users
        localStorage.setItem('xenon_completed_todos', JSON.stringify(updatedTodos));
        
        // Get current todos and add the restored one back
        const currentTodos = JSON.parse(localStorage.getItem('xenon_todos') || '[]');
        const todoToRestore = completedTodos.find(todo => todo.id === id);
        if (todoToRestore) {
          todoToRestore.completed = false;
          localStorage.setItem('xenon_todos', JSON.stringify([...currentTodos, todoToRestore]));
        }
      }
      
      toast({
        title: "Task restored",
        description: "Task has been moved back to your todo list"
      });
      
    } catch (error) {
      console.error("Error restoring task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore task"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl text-purple-400 font-light">
            Completed Tasks
          </h1>
          
          {completedTodos.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={deleteAllCompleted}
              disabled={isDeleting}
              className="bg-red-700 hover:bg-red-800"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Clear All
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : completedTodos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">You have no completed tasks yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {completedTodos.map(todo => (
              <li 
                key={todo.id} 
                className="flex items-center justify-between p-3 rounded-md border border-gray-800 bg-gray-900/30"
              >
                <span className="text-gray-400 flex-1 line-through">{todo.text}</span>
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => restoreTask(todo.id)}
                    className="h-8 w-8 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
