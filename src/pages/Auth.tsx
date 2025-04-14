
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import SplashScreen from "@/components/SplashScreen";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const { user, session, isVerified, checkEmailVerification } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user has completed onboarding questionnaire
  useEffect(() => {
    const checkFirstTimeUser = () => {
      const hasCompletedQuestionnaire = localStorage.getItem('xenon_onboarding_completed');
      
      // If user is authenticated and verified but hasn't completed questionnaire
      if (user && isVerified && !hasCompletedQuestionnaire) {
        navigate('/questionnaire');
        return;
      }
      
      // If user is guest (skipped login) but hasn't completed questionnaire
      if (!user && !hasCompletedQuestionnaire && !showSplash) {
        navigate('/questionnaire');
        return;
      }
      
      // If user is authenticated and has completed questionnaire
      if (user && isVerified && hasCompletedQuestionnaire) {
        navigate('/home');
      }
    };
    
    if (!showSplash) {
      checkFirstTimeUser();
    }
  }, [user, isVerified, showSplash, navigate]);

  // Check email verification status when page loads
  useEffect(() => {
    const verifyEmail = async () => {
      if (user && session && !isVerified) {
        setCheckingVerification(true);
        try {
          // Check if email is verified
          const isEmailVerified = await checkEmailVerification();
          
          if (isEmailVerified) {
            toast({
              title: "Email verified!",
              description: "Your email has been successfully verified.",
            });
            
            // Check if questionnaire is completed
            const hasCompletedQuestionnaire = localStorage.getItem('xenon_onboarding_completed');
            if (!hasCompletedQuestionnaire) {
              navigate('/questionnaire');
            } else {
              navigate('/home');
            }
          } else {
            // If not verified, show a notification
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please check your email and verify your account before proceeding.",
            });
          }
        } catch (error) {
          console.error("Error checking verification:", error);
        } finally {
          setCheckingVerification(false);
        }
      }
    };
    
    if (!showSplash) {
      verifyEmail();
    }
  }, [user, session, showSplash, navigate, isVerified, checkEmailVerification, toast]);

  // Handle skip login action
  const handleSkipLogin = () => {
    // Skip directly to questionnaire without login
    navigate('/questionnaire');
  };

  // If user is already authenticated and email verified, redirect to home
  if (user && isVerified) {
    const hasCompletedQuestionnaire = localStorage.getItem('xenon_onboarding_completed');
    if (hasCompletedQuestionnaire) {
      return <Navigate to="/home" replace />;
    }
    return <Navigate to="/questionnaire" replace />;
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
          
          {checkingVerification ? (
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">Verifying your email...</p>
            </div>
          ) : (
            <AuthFormContainer />
          )}
          
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
