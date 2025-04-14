
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
  user_id?: string;
}

export default function TodoPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletedLoading, setIsCompletedLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  
  // Load completed todos
  useEffect(() => {
    const loadCompletedTodos = async () => {
      setIsCompletedLoading(true);
      
      try {
        if (user) {
          // Fetch completed todos from Supabase
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('created_at', { ascending: false });
          
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
        setIsCompletedLoading(false);
      }
    };
    
    loadCompletedTodos();
  }, [user, toast]);

  // Save todos
  const saveTodos = async (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
    }
  };
  
  // Save completed todos
  const saveCompletedTodos = async (updatedTodos: TodoItem[]) => {
    setCompletedTodos(updatedTodos);
    
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('xenon_completed_todos', JSON.stringify(updatedTodos));
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
      
      // Add to completed todos
      if (todoToComplete) {
        const completedTodo = {...todoToComplete, completed: true};
        const updatedCompletedTodos = [completedTodo, ...completedTodos];
        saveCompletedTodos(updatedCompletedTodos);
      }
      
      toast({
        title: "Task completed",
        description: "Task has been marked as complete"
      });
      
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
          .update({ completed: false })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Find the task to restore
      const todoToRestore = completedTodos.find(todo => todo.id === id);
      
      // Update completed todos list
      const updatedCompletedTodos = completedTodos.filter(todo => todo.id !== id);
      saveCompletedTodos(updatedCompletedTodos);
      
      // Add back to active todos
      if (todoToRestore) {
        const restoredTodo = {...todoToRestore, completed: false};
        const updatedTodos = [restoredTodo, ...todos];
        saveTodos(updatedTodos);
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
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-gray-900/30">
              <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
                Completed
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "completed" && completedTodos.length > 0 && (
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
          
          <TabsContent value="pending" className="pt-2">
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
          </TabsContent>
          
          <TabsContent value="completed" className="pt-2">
            {isCompletedLoading ? (
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
