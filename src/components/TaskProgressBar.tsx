
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ListTodo } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const TaskProgressBar = () => {
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Fetch from Supabase
          const { data: todos } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id);
            
          if (todos) {
            setTotalTasks(todos.length);
            setCompletedTasks(todos.filter((todo: TodoItem) => todo.completed).length);
          }
        } else {
          // Fetch from localStorage for guests
          const savedTodos = localStorage.getItem('xenon_todos');
          const savedCompleted = localStorage.getItem('xenon_completed_todos');
          
          if (savedTodos) {
            const todos = JSON.parse(savedTodos);
            setTotalTasks(todos.length);
          }
          
          if (savedCompleted) {
            const completed = JSON.parse(savedCompleted);
            setCompletedTasks(completed.length);
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasksData();
  }, [user]);

  const calculateProgress = () => {
    if (totalTasks === 0) return 0;
    return (completedTasks / totalTasks) * 100;
  };

  return (
    <div className="w-full max-w-md bg-gray-900/30 p-4 rounded-lg border border-gray-800">
      <div className="flex items-center mb-4">
        <ListTodo className="text-purple-400 mr-2" />
        <h2 className="text-xl text-purple-400 font-semibold">Task Progress</h2>
      </div>
      
      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading tasks...</div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Tasks completed</span>
            <span>{completedTasks} of {totalTasks}</span>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-gray-800" />
          
          <div className="flex justify-between mt-4">
            <div className="flex items-center text-gray-400 text-sm">
              <ListTodo className="h-4 w-4 mr-1 text-purple-400" />
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
            
            <div className="flex items-center text-gray-400 text-sm">
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              <span>{completedTasks} completed</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskProgressBar;
