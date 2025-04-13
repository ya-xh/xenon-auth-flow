
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
}

export default function TodoPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load todos - from Supabase if logged in, otherwise from localStorage
  useEffect(() => {
    const loadTodos = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Fetch todos from Supabase
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', false)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            setTodos(data as TodoItem[]);
          }
        } else {
          // Load from localStorage for guest users
          const saved = localStorage.getItem('xenon_todos');
          if (saved) {
            setTodos(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error("Error loading todos:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your todo items"
        });
        
        // Fallback to localStorage
        const saved = localStorage.getItem('xenon_todos');
        if (saved) {
          setTodos(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTodos();
  }, [user, toast]);

  // Save todos
  const saveTodos = async (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
    }
  };

  // Add todo
  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    
    setIsSyncing(true);
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      user_id: user ? user.id : undefined
    };
    
    try {
      if (user) {
        // Add to Supabase
        const { data, error } = await supabase
          .from('todos')
          .insert([{ 
            text: newTodoText,
            completed: false,
            user_id: user.id
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data[0]) {
          const updatedTodos = [...todos, data[0] as TodoItem];
          setTodos(updatedTodos);
        }
      } else {
        // Save to localStorage for guest users
        const updatedTodos = [...todos, newTodo];
        localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
        setTodos(updatedTodos);
      }
      
      toast({
        title: "Todo added",
        description: "New task has been added to your list"
      });
      
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add task"
      });
    } finally {
      setNewTodoText("");
      setIsSyncing(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id: string) => {
    setIsSyncing(true);
    
    try {
      if (user) {
        // Update in Supabase
        const { error } = await supabase
          .from('todos')
          .update({ completed: true })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Update local state
      const todoToComplete = todos.find(t => t.id === id);
      const updatedTodos = todos.filter(todo => todo.id !== id);
      saveTodos(updatedTodos);
      
      // Save to completed todos in localStorage for guest users
      if (!user && todoToComplete) {
        const completedTodo = {...todoToComplete, completed: true};
        const savedCompleted = localStorage.getItem('xenon_completed_todos');
        const completedTodos = savedCompleted ? JSON.parse(savedCompleted) : [];
        localStorage.setItem('xenon_completed_todos', JSON.stringify([...completedTodos, completedTodo]));
      }
      
    } catch (error) {
      console.error("Error completing todo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    setIsSyncing(true);
    
    try {
      if (user) {
        // Delete from Supabase
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Update local state
      const updatedTodos = todos.filter(todo => todo.id !== id);
      saveTodos(updatedTodos);
      
      toast({
        title: "Todo removed",
        description: "Task has been deleted"
      });
      
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl text-purple-400 font-light mb-6">
          To-Do List
        </h1>
        
        <div className="flex items-center space-x-2 mb-6">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            className="bg-black border-gray-700 text-white focus:border-purple-500"
            disabled={isSyncing}
          />
          <Button 
            onClick={addTodo}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">You have no pending tasks. Add a new task to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li 
                key={todo.id} 
                className="flex items-center justify-between p-3 rounded-md border border-gray-800 bg-gray-900/30"
              >
                <span className="text-gray-200 flex-1">{todo.text}</span>
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => toggleTodo(todo.id)}
                    className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    disabled={isSyncing}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    disabled={isSyncing}
                  >
                    <Trash2 className="h-5 w-5" />
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
