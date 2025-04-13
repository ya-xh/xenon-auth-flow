
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (name: string) => Promise<void>;
  isVerified: boolean;
  checkEmailVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  // Check if email is verified
  const checkEmailVerification = async () => {
    try {
      // Refresh the session to get the latest user info
      const { data } = await supabase.auth.refreshSession();
      
      // Update session with fresh data
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Check if email is verified
        const isEmailVerified = data.session.user.email_confirmed_at !== null;
        setIsVerified(isEmailVerified);
        return isEmailVerified;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return false;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          // Check if email is verified when user signs in
          if (currentSession?.user) {
            const isEmailVerified = currentSession.user.email_confirmed_at !== null;
            setIsVerified(isEmailVerified);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsVerified(false);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check email verification status
      if (currentSession?.user) {
        const isEmailVerified = currentSession.user.email_confirmed_at !== null;
        setIsVerified(isEmailVerified);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "You've successfully signed in",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy_password_to_check_existence"
      });
      
      // If no error or specific error that indicates user might exist
      if (!checkError || checkError.message.includes("Invalid login credentials")) {
        // Try to get the user
        const { data } = await supabase.from('profiles')
                          .select('id')
                          .eq('id', existingUser?.user?.id ?? '')
                          .single();
                          
        if (data || existingUser?.user) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          setIsLoading(false);
          throw new Error("Account already exists");
        }
      }
      
      // If we got here, the user doesn't exist, so create a new account
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your email to verify your account",
      });
    } catch (error: any) {
      if (error.message === "Account already exists") {
        // Already handled above
        throw error;
      }
      console.error('Sign up error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isLoading,
    updateProfile,
    isVerified,
    checkEmailVerification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
