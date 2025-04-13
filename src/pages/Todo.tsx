
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    // Load todos from local storage
    const saved = localStorage.getItem('xenon_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodoText, setNewTodoText] = useState("");

  const saveTodos = (updatedTodos: TodoItem[]) => {
    localStorage.setItem('xenon_todos', JSON.stringify(updatedTodos));
    setTodos(updatedTodos);
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false
    };
    
    const updatedTodos = [...todos, newTodo];
    saveTodos(updatedTodos);
    setNewTodoText("");
    
    toast({
      title: "Todo added",
      description: "New task has been added to your list"
    });
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    
    toast({
      title: "Todo removed",
      description: "Task has been deleted"
    });
  };

  const incompleteTodos = todos.filter(todo => !todo.completed);

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
          />
          <Button 
            onClick={addTodo}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {incompleteTodos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">You have no pending tasks. Add a new task to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {incompleteTodos.map(todo => (
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
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
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
