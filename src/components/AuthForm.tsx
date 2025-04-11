
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, User as UserIcon } from "lucide-react";
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
  const { signIn, signUp, isLoading, updateProfile, user } = useAuth();

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

  // Conditionally render the appropriate form based on the verification step
  if (verificationStep === 'profile') {
    return (
      <Card className="w-full max-w-md bg-black/70 backdrop-blur-lg border border-purple-600/30 shadow-xl">
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
    <Card className="w-full max-w-md bg-black/70 backdrop-blur-lg border border-purple-600/30 shadow-xl">
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
        <Form {...authForm}>
          <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-6">
            <FormField
              control={authForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary" 
                      {...field} 
                    />
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
