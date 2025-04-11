
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import SplashScreen from "@/components/SplashScreen";

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useAuth();

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
          <div className="w-full max-w-md mb-12">
            <h1 className="text-5xl md:text-7xl font-mono font-light text-center bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">xenon ai</h1>
          </div>
          
          <AuthForm />
          
          <p className="text-gray-500 text-xs mt-8 text-center">
            © {new Date().getFullYear()} Xenon AI. All rights reserved.
          </p>
        </div>
      )}
    </>
  );
}
