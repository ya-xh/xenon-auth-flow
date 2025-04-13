
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const UserQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [focusHours, setFocusHours] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (currentStep === 0 && !name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name to continue"
      });
      return;
    }
    
    if (currentStep === 1 && !role) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select your role to continue"
      });
      return;
    }
    
    if (currentStep === 2) {
      if (!focusHours) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your daily focus hours"
        });
        return;
      }
      
      // Check if hours are within valid range (1-20)
      const hours = parseInt(focusHours);
      if (isNaN(hours) || hours < 1 || hours > 20) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a number between 1 and 20"
        });
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        if (user) {
          // For authenticated users, save to profiles table
          const { error } = await supabase
            .from('profiles')
            .update({
              name,
              user_role: role,
              focus_hours: hours
            })
            .eq('id', user.id);
          
          if (error) throw error;
        } else {
          // For users who skipped login, save to localStorage
          localStorage.setItem('xenon_user_name', name);
          localStorage.setItem('xenon_user_role', role);
          localStorage.setItem('xenon_focus_hours', hours.toString());
        }
        
        toast({
          title: "Setup complete",
          description: "Your preferences have been saved"
        });
        
        // Navigate to home page
        navigate('/home');
        
      } catch (error) {
        console.error("Error saving preferences:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save your preferences"
        });
      } finally {
        setIsSubmitting(false);
      }
      
      return;
    }
    
    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">What's your name?</CardTitle>
              <CardDescription className="text-center">
                Let us know what to call you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/30 border-gray-700"
                  />
                </div>
              </div>
            </CardContent>
          </>
        );
      case 1:
        return (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">What's your role?</CardTitle>
              <CardDescription className="text-center">
                Select the option that best describes you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={role} onValueChange={setRole}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional">Working Professional</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer">Freelancer</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="entrepreneur" id="entrepreneur" />
                  <Label htmlFor="entrepreneur">Entrepreneur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">How many hours do you want to focus daily?</CardTitle>
              <CardDescription className="text-center">
                Enter a number between 1 and 20
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="focusHours">Focus Hours</Label>
                <Input
                  id="focusHours"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Enter hours (1-20)"
                  value={focusHours}
                  onChange={(e) => setFocusHours(e.target.value)}
                  className="bg-black/30 border-gray-700"
                />
              </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border border-purple-600/30 shadow-xl">
      {renderStep()}
      <CardFooter className="flex justify-between">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          className={`${
            currentStep === 0 && !name ? "ml-auto" : ""
          } bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Saving</span>
              <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </>
          ) : currentStep === 2 ? (
            "Finish"
          ) : (
            "Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserQuestionnaire;
