import { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, User, Menu } from "lucide-react";
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

  // Protect routes - redirect to auth if not logged in
  if (!user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          if (data && data.name) {
            setUserName(data.name);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

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
          
          {userName && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-300">{userName}</span>
              </div>
            </div>
          )}
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
