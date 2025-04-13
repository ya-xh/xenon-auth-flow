
import { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, ListTodo, Settings, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState<string>("");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const isMobile = useIsMobile();
  const [role, setRole] = useState<string | null>(null);
  const [focusHours, setFocusHours] = useState<string | null>(null);

  useEffect(() => {
    // If this is a skipped login user, look for data in localStorage
    const storedRole = localStorage.getItem('xenon_user_role');
    const storedHours = localStorage.getItem('xenon_focus_hours');
    
    if (storedRole) setRole(storedRole);
    if (storedHours) setFocusHours(storedHours);
    
    // If user is logged in, fetch from Supabase
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name, user_role, focus_hours')
            .eq('id', user.id)
            .single();
          
          if (data && data.name) {
            setUserName(data.name);
          }
          if (data && data.user_role) {
            setRole(data.user_role);
          }
          if (data && data.focus_hours) {
            setFocusHours(String(data.focus_hours));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // For skipped login, don't redirect to auth
  if (!user && !isLoading && !localStorage.getItem('xenon_user_role')) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-purple-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-purple-600/10 text-purple-400 border-l-2 border-purple-600" 
      : "text-gray-400 hover:text-purple-400 hover:bg-purple-600/5";
  };

  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-black">
        <h1 className="text-3xl text-purple-400 font-mono font-light">xenon ai</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileNav}>
          <Menu className="h-6 w-6 text-purple-400" />
        </Button>
      </header>
      
      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-2xl text-purple-400">Menu</h2>
            <Button variant="ghost" size="icon" onClick={toggleMobileNav}>
              <span className="text-2xl text-purple-400">&times;</span>
            </Button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/home" 
                  className={`block py-2 px-4 rounded ${isActive('/home')}`}
                  onClick={toggleMobileNav}
                >
                  <div className="flex items-center">
                    <MessageSquare className="mr-3 h-5 w-5" />
                    Home
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/todo" 
                  className={`block py-2 px-4 rounded ${isActive('/todo')}`}
                  onClick={toggleMobileNav}
                >
                  <div className="flex items-center">
                    <ListTodo className="mr-3 h-5 w-5" />
                    To-do
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/completed" 
                  className={`block py-2 px-4 rounded ${isActive('/completed')}`}
                  onClick={toggleMobileNav}
                >
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    Completed Tasks
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`block py-2 px-4 rounded ${isActive('/settings')}`}
                  onClick={toggleMobileNav}
                >
                  <div className="flex items-center">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-3xl text-purple-400 font-mono font-light">xenon ai</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <Link to="/home">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive('/home')}`}
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Home
                </Button>
              </Link>
              
              <Link to="/todo">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive('/todo')}`}
                >
                  <ListTodo className="mr-3 h-5 w-5" />
                  To-do
                </Button>
              </Link>
              
              <Link to="/completed">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive('/completed')}`}
                >
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Completed Tasks
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive('/settings')}`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              {userName ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-300">{userName}</span>
                </>
              ) : (
                <span className="text-gray-300">
                  {role ? `${role} (Guest)` : 'Guest User'}
                </span>
              )}
            </div>
            
            {role && focusHours && (
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Focus: {focusHours} hours daily
              </p>
            )}
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
