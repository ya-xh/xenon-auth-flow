
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, User as UserIcon, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

type AuthFormValues = z.infer<typeof authSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'auth' | 'profile'>('auth');
  const [email, setEmail] = useState('');
  const { signIn, signUp, isLoading, updateProfile, user, signInWithGoogle } = useAuth();

  // If user is logged in and on the auth page, check if we need to ask for their name
  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          if (data && (!data.name || data.name.trim() === '')) {
            setVerificationStep('profile');
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
  }, [user]);

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const onAuthSubmit = async (data: AuthFormValues) => {
    try {
      setEmail(data.email);
      if (isSignUp) {
        await signUp(data.email, data.password);
        // For sign up, we don't switch to OTP step here because Supabase handles email verification
      } else {
        await signIn(data.email, data.password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data.name);
      // Profile updated, verification flow complete
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    authForm.reset();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  // Conditionally render the appropriate form based on the verification step
  if (verificationStep === 'profile') {
    return (
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border border-purple-600/30 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-medium text-center text-white">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Please tell us your name to complete setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Your Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary pl-10" 
                          placeholder="Enter your name"
                          {...field}
                        />
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-xenon-primary to-xenon-secondary hover:from-xenon-secondary hover:to-xenon-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Complete Setup</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
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
        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-700 bg-black text-white hover:bg-gray-900/50 hover:text-purple-300 flex items-center justify-center gap-2 mb-6"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          {isLoading ? "Processing..." : "Continue with Google"}
        </Button>
        
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with email</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>
        
        <Form {...authForm}>
          <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-6">
            <FormField
              control={authForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="your.email@example.com" 
                        className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary pl-10" 
                        {...field} 
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={authForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary pr-12"
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>{isSignUp ? "Sign Up" : "Sign In"}</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          className="text-purple-300 hover:text-purple-400"
          onClick={toggleAuthMode}
          disabled={isLoading}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
