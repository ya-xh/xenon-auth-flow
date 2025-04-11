
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState<string>("");

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
        <div className="text-xenon-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-xenon-primary/10 text-xenon-primary" : "text-gray-400 hover:text-xenon-primary hover:bg-xenon-primary/5";
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900/50 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-3xl text-xenon-primary font-mono font-light">xenon ai</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${isActive('/home')}`}
              asChild
            >
              <a href="/home">
                <MessageSquare className="mr-3 h-5 w-5" />
                Home
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${isActive('/settings')}`}
              asChild
            >
              <a href="/settings">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${isActive('/profile')}`}
              asChild
            >
              <a href="/profile">
                <User className="mr-3 h-5 w-5" />
                Profile
              </a>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
          <h1 className="text-3xl text-xenon-primary font-mono font-light">xenon ai</h1>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
