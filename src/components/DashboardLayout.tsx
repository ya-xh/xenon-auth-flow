
import React, { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, ListTodo, Settings, Menu, X, Home } from "lucide-react";
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
    const storedName = localStorage.getItem('xenon_user_name');
    const storedRole = localStorage.getItem('xenon_user_role');
    const storedHours = localStorage.getItem('xenon_focus_hours');
    
    if (storedName) setUserName(storedName);
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
  
  const isActiveBottom = (path: string) => {
    return location.pathname === path 
      ? "text-purple-400" 
      : "text-gray-400";
  };

  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  const navigationItems = [
    { path: '/home', label: 'Home', icon: <Home className="mr-3 h-5 w-5" /> },
    { path: '/todo', label: 'To-do', icon: <ListTodo className="mr-3 h-5 w-5" /> },
    { path: '/completed', label: 'Completed Tasks', icon: <CheckCircle className="mr-3 h-5 w-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-black">
        <h1 className="text-3xl text-purple-400 font-mono font-light">xenon ai</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileNav} aria-label="Toggle menu">
          <Menu className="h-6 w-6 text-purple-400" />
        </Button>
      </header>
      
      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-2xl text-purple-400">Menu</h2>
            <Button variant="ghost" size="icon" onClick={toggleMobileNav} aria-label="Close menu">
              <X className="h-6 w-6 text-purple-400" />
            </Button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-4">
              {navigationItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`block py-2 px-4 rounded ${isActive(item.path)}`}
                    onClick={toggleMobileNav}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-3xl text-purple-400 font-mono font-light">xenon ai</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigationItems.map(item => (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${isActive(item.path)}`}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              ))}
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
        <main className="flex-1 overflow-y-auto bg-black pb-16 md:pb-0">
          {children}
        </main>
      </div>
      
      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
        <div className="flex justify-around">
          {navigationItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-3 ${isActiveBottom(item.path)}`}
            >
              {React.cloneElement(item.icon, { className: "h-5 w-5 mb-1" })}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
