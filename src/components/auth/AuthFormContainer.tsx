import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EmailPasswordForm from "./EmailPasswordForm";
import ProfileForm from "./ProfileForm";
import UserQuestionnaire from "./UserQuestionnaire";
import GoogleAuthButton from "./GoogleAuthButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthFormContainer = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'auth' | 'profile' | 'questionnaire'>('auth');
  const [email, setEmail] = useState('');
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, check if we need to ask for their name or preferences
  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, user_role, focus_hours')
            .eq('id', user.id)
            .single();
          
          if (data) {
            // If name is missing, go to profile step
            if (!data.name || data.name.trim() === '') {
              setVerificationStep('profile');
              return;
            }
            
            // If role or focus hours are missing, go to questionnaire step
            if (!data.user_role || !data.focus_hours) {
              setVerificationStep('questionnaire');
              return;
            }
            
            // If all data is present, navigate to home
            navigate('/home');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      };
      
      // Use setTimeout to avoid deadlock with onAuthStateChange
      setTimeout(() => {
        checkProfile();
      }, 0);
    }
  }, [user, navigate]);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  // Conditionally render the appropriate form based on the verification step
  if (verificationStep === 'profile') {
    return <ProfileForm onComplete={() => setVerificationStep('questionnaire')} />;
  }

  if (verificationStep === 'questionnaire') {
    return <UserQuestionnaire />;
  }

  return (
    <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border border-purple-600/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-center text-white">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          {isSignUp
            ? "Sign up to get started with Xenon AI"
            : "Sign in to continue with Xenon AI"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleAuthButton isLoading={isLoading} />
        
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with email</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>
        
        <EmailPasswordForm 
          isSignUp={isSignUp} 
          isLoading={isLoading} 
          setEmail={setEmail} 
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <button 
          type="button"
          className="text-purple-300 hover:text-purple-400 bg-transparent border-none cursor-pointer font-medium"
          onClick={toggleAuthMode}
          disabled={isLoading}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </CardFooter>
    </Card>
  );
};

export default AuthFormContainer;
