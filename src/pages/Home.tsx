
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import FlipClock from "@/components/FlipClock";

interface UserProfile {
  name: string;
  user_role?: string;
  focus_hours?: number;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTodos, setRecentTodos] = useState<TodoItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      
      // Check if this is a skipped login user
      const storedRole = localStorage.getItem('xenon_user_role');
      const storedHours = localStorage.getItem('xenon_focus_hours');
      const storedName = localStorage.getItem('xenon_user_name');
      
      if (storedRole && !user) {
        // This is a guest user who skipped login
        setUserProfile({
          name: storedName || 'Guest',
          user_role: storedRole,
          focus_hours: storedHours ? parseInt(storedHours) : undefined
        });
        setIsGuest(true);
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from Supabase if logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, user_role, focus_hours')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setUserProfile(data as UserProfile);
          } else if (error) {
            console.error('Error fetching profile:', error);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchUserProfile();
  }, [user]);

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
      }
    };
    
    fetchRecentTodos();
  }, [user]);

  const getRoleDisplay = (role?: string) => {
    if (!role) return '';
    
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'professional': 'Working Professional',
      'freelancer': 'Freelancer',
      'entrepreneur': 'Entrepreneur',
      'other': 'Other'
    };
    
    return roleMap[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-start h-full pt-4">
            <h1 className="text-4xl md:text-6xl font-mono font-light mb-6 text-center bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Welcome to Xenon AI
              {userProfile?.name ? `, ${userProfile.name}` : isGuest ? ', Guest' : ''}
            </h1>
            
            {userProfile?.user_role && (
              <p className="text-xl text-purple-300 mb-4 text-center">
                {getRoleDisplay(userProfile.user_role)}
                {userProfile.focus_hours && ` • ${userProfile.focus_hours} hours focus time`}
              </p>
            )}

            {/* Flip Clock */}
            <div className="my-10 w-full max-w-md">
              <FlipClock />
            </div>
            
            {/* Recent Todos Section */}
            <div className="w-full max-w-md mt-6">
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
