
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import SplashScreen from "@/components/SplashScreen";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  // Check email verification status when page loads
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user && session) {
        // Refresh user data to get latest verification status
        const { data: { user: refreshedUser } } = await session.user.refresh();
        
        // If user's email is verified, proceed to the app
        if (refreshedUser && refreshedUser.email_confirmed_at) {
          navigate('/home');
        }
      }
    };
    
    if (!showSplash) {
      checkEmailVerification();
    }
  }, [user, session, showSplash, navigate]);

  // Handle skip login action
  const handleSkipLogin = () => {
    navigate('/home');
  };

  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md mb-8">
            <h1 className="text-7xl md:text-8xl font-mono font-light text-center bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              xenon ai
            </h1>
          </div>
          
          <AuthFormContainer />
          
          <div className="mt-6 w-full max-w-md">
            <Button
              variant="ghost"
              className="w-full text-purple-300 hover:text-purple-400 hover:bg-transparent"
              onClick={handleSkipLogin}
            >
              Skip Login
            </Button>
          </div>
          
          <p className="text-gray-500 text-xs mt-8 text-center">
            © {new Date().getFullYear()} Xenon AI. All rights reserved.
          </p>
        </div>
      )}
    </>
  );
}
