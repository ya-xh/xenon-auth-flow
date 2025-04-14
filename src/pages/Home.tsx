
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import FlipClock from "@/components/FlipClock";
import FocusTimer from "@/components/FocusTimer";
import TaskProgressBar from "@/components/TaskProgressBar";
import MotivationalQuote from "@/components/MotivationalQuote";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recentTodos, setRecentTodos] = useState<TodoItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);

  // Fetch recent todos
  useEffect(() => {
    const fetchRecentTodos = async () => {
      setTodosLoading(true);
      try {
        if (user) {
          // Fetch from Supabase
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', false)
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (error) throw error;
          if (data) {
            setRecentTodos(data as TodoItem[]);
          }
        } else {
          // Fetch from localStorage for guests
          const saved = localStorage.getItem('xenon_todos');
          if (saved) {
            const allTodos = JSON.parse(saved);
            setRecentTodos(allTodos.slice(0, 3)); // Get only the most recent 3
          }
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        setTodosLoading(false);
        setIsLoading(false);
      }
    };
    
    fetchRecentTodos();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-start h-full pt-4 space-y-8">
            {/* Flip Clock */}
            <div className="my-6 w-full max-w-lg">
              <FlipClock />
            </div>
            
            {/* Focus Timer */}
            <div className="w-full max-w-lg">
              <FocusTimer />
            </div>
            
            {/* Task Progress */}
            <div className="w-full max-w-lg">
              <TaskProgressBar />
            </div>
            
            {/* Recent Todos Section */}
            <div className="w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-purple-300 font-semibold">Recent Tasks</h2>
                <Link 
                  to="/todo" 
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  View All
                </Link>
              </div>
              
              {todosLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                </div>
              ) : recentTodos.length > 0 ? (
                <ul className="space-y-2">
                  {recentTodos.map(todo => (
                    <Link 
                      to="/todo" 
                      key={todo.id}
                      className="block p-3 rounded-md border border-gray-800 bg-gray-900/30 hover:bg-gray-800/30 transition-colors"
                    >
                      <span className="text-gray-200">{todo.text}</span>
                    </Link>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No tasks yet. Add one from the Todo page.
                </p>
              )}
            </div>
            
            {/* Motivational Quote */}
            <div className="w-full max-w-lg">
              <MotivationalQuote />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
