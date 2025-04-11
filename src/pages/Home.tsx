
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl md:text-3xl text-xenon-primary font-light mb-6">
            Welcome to Xenon AI
            {user?.email ? `, ${user.email.split("@")[0]}` : ''}
          </h1>
          
          <p className="text-gray-400 text-center max-w-md mb-12">
            Your personal AI assistant is being configured. 
            Check back soon for exciting new features.
          </p>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-xenon-primary to-xenon-secondary animate-pulse"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
