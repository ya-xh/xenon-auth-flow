
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { LogOut, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isGuest = !user && localStorage.getItem('xenon_user_role');

  const handleLogout = async () => {
    await signOut();
    // Clear local storage for guest user data
    localStorage.removeItem('xenon_user_name');
    localStorage.removeItem('xenon_user_role');
    localStorage.removeItem('xenon_focus_hours');
    localStorage.removeItem('xenon_todos');
    localStorage.removeItem('xenon_completed_todos');
    // Redirect to auth page after logout
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl text-purple-400 font-light mb-6">
          Settings
        </h1>
        
        <div className="flex-1 mb-8">
          <p className="text-gray-400 mb-8">
            Settings options will be available soon.
          </p>
          
          {isGuest && (
            <div className="mb-6 p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg">
              <h2 className="text-lg text-purple-400 mb-2">Create an Account</h2>
              <p className="text-gray-400 mb-4">
                You're currently using the app as a guest. Create an account to save your data and access it from any device.
              </p>
              <Link to="/">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Logout button moved to bottom */}
        <div className="border-t border-gray-800 pt-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-600/5"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
