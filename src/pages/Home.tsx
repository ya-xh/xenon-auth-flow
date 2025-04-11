
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

export default function HomePage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          
          if (data && data.name) {
            setUserName(data.name);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl md:text-5xl text-xenon-primary font-light mb-6 text-center">
            Welcome to Xenon AI
            {userName ? `, ${userName}` : ''}
          </h1>
          
          <p className="text-gray-400 text-center max-w-md mb-12">
            Your personal AI assistant is being configured. 
            Check back soon for exciting new features.
          </p>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-xenon-primary to-purple-600 animate-pulse"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
