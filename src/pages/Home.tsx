import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  name: string;
  user_role?: string;
  focus_hours?: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, user_role, focus_hours')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setUserProfile(data as UserProfile);
          } else if (error) {
            console.error('Error fetching profile:', error);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const getRoleDisplay = (role?: string) => {
    if (!role) return '';
    
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'professional': 'Working Professional',
      'freelancer': 'Freelancer',
      'entrepreneur': 'Entrepreneur',
      'other': 'Other'
    };
    
    return roleMap[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl md:text-6xl font-mono font-light mb-6 text-center bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Welcome to Xenon AI
            {userProfile?.name ? `, ${userProfile.name}` : ''}
          </h1>
          
          {userProfile?.user_role && (
            <p className="text-xl text-purple-300 mb-4 text-center">
              {getRoleDisplay(userProfile.user_role)}
              {userProfile.focus_hours && ` • ${userProfile.focus_hours} hours focus time`}
            </p>
          )}
          
          <p className="text-gray-400 text-center max-w-md mb-12">
            Your personal AI assistant is being configured. 
            Check back soon for exciting new features.
          </p>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 animate-pulse"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
