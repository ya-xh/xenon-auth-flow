
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl text-xenon-primary font-light mb-6">
          Settings
        </h1>
        
        <div className="flex-1 mb-8">
          <p className="text-gray-400">
            Settings options will be available soon.
          </p>
        </div>
        
        {/* Logout button moved to bottom */}
        <div className="border-t border-gray-800 pt-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-gray-400 hover:text-xenon-primary hover:bg-xenon-primary/5"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
