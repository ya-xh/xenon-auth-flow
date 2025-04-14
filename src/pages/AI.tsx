
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BrainCircuit, ShieldAlert, Clock, CheckCircle2, Calendar, Activity, Smile } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIPage() {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [blockedApps, setBlockedApps] = useState<string[]>([
    "Instagram", "YouTube", "Facebook", "TikTok", "Twitter", "Reddit", "Netflix"
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("appMonitoring");
  const [userMood, setUserMood] = useState("neutral");
  const [userEnergy, setUserEnergy] = useState("medium");
  const [planInput, setPlanInput] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('ai_monitoring_enabled, blocked_apps')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }
          
          if (data) {
            setMonitoringEnabled(data.ai_monitoring_enabled || false);
            if (data.blocked_apps && Array.isArray(data.blocked_apps)) {
              setBlockedApps(data.blocked_apps);
            }
          }
        } else {
          // For guest users, check localStorage
          const savedMonitoring = localStorage.getItem('xenon_ai_monitoring');
          const savedApps = localStorage.getItem('xenon_blocked_apps');
          
          if (savedMonitoring) {
            setMonitoringEnabled(savedMonitoring === 'true');
          }
          if (savedApps) {
            setBlockedApps(JSON.parse(savedApps));
          }
        }
      } catch (error) {
        console.error("Error loading AI preferences:", error);
      }
    };
    
    loadUserPreferences();
  }, [user]);

  // Save user preferences
  const savePreferences = async (monitoring: boolean, apps: string[]) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ai_monitoring_enabled: monitoring,
            blocked_apps: apps
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error saving to database:", error);
          throw error;
        }
      } else {
        // For guest users
        localStorage.setItem('xenon_ai_monitoring', monitoring.toString());
        localStorage.setItem('xenon_blocked_apps', JSON.stringify(apps));
      }
    } catch (error) {
      console.error("Error saving AI preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your preferences"
      });
    }
  };

  // Toggle monitoring
  const toggleMonitoring = async (value: boolean) => {
    setMonitoringEnabled(value);
    await savePreferences(value, blockedApps);
    
    toast({
      title: value ? "Monitoring Enabled" : "Monitoring Disabled",
      description: value 
        ? "AI will now monitor your app usage and provide productivity warnings" 
        : "App usage monitoring has been turned off",
    });
    
    // Request permissions for real devices
    if (value) {
      // This would integrate with Capacitor plugin in a real implementation
      toast({
        title: "Permission Required",
        description: "Please grant usage stats permission in the next screen",
      });
    }
  };

  // Simulate app detection with OpenAI (in a real app, this would be done in native code)
  const simulateAppDetection = async () => {
    setIsLoading(true);
    
    try {
      // This is a simulation. In a real app, we would use a Capacitor plugin
      // to detect the current app and then use OpenAI to classify it
      
      // Simulated detection of a productivity app
      const detectedApp = blockedApps[Math.floor(Math.random() * blockedApps.length)];
      
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: `Unproductive App Detected: ${detectedApp}`,
          description: "You're spending time on an app that may reduce your productivity. Consider switching to a task from your todo list.",
          duration: 10000,
        });
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error in app detection:", error);
      toast({
        variant: "destructive",
        title: "Detection Error",
        description: "Failed to analyze your current app usage",
      });
      setIsLoading(false);
    }
  };

  // Generate AI plan
  const generateDailyPlan = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call an OpenAI API endpoint
      setTimeout(() => {
        const planSteps = [
          "08:00 - 09:00: Morning meditation and exercise",
          "09:00 - 11:30: Complete the project proposal (high priority task)",
          "11:30 - 12:30: Lunch break - light meal suggested for your energy levels",
          "13:00 - 15:00: Team meeting and collaboration session",
          "15:00 - 16:30: Focused work on coding the new feature",
          "16:30 - 17:30: Respond to emails and admin tasks",
          "18:00 - 19:00: Leisure activity based on your current mood"
        ];
        
        let moodSuggestion = "";
        if (userMood === "energetic") {
          moodSuggestion = "Since you're feeling energetic today, I've scheduled your most demanding tasks during your peak hours. Consider taking on that challenging project you've been postponing.";
        } else if (userMood === "tired") {
          moodSuggestion = "I've adapted your schedule for lower energy today. Focus on lighter tasks and be sure to take short breaks. Consider a 20-minute power nap after lunch.";
        } else {
          moodSuggestion = "Your schedule is balanced for your neutral mood today. Remember to take regular breaks to maintain your energy levels throughout the day.";
        }
        
        setGeneratedPlan(`Based on your input, energy level (${userEnergy}) and mood (${userMood}), here's your optimized daily plan:\n\n${planSteps.join("\n")}\n\n${moodSuggestion}`);
        setIsLoading(false);
        
        toast({
          title: "Daily Plan Generated",
          description: "Your personalized plan is ready to view",
        });
      }, 2000);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate your daily plan"
      });
      setIsLoading(false);
    }
  };

  // Listen for focus mode changes
  useEffect(() => {
    const focusTimerKey = 'xenon_focus_timer_active';
    
    const checkFocusTimer = () => {
      const isTimerActive = localStorage.getItem(focusTimerKey) === 'true';
      if (isTimerActive && !focusMode) {
        setFocusMode(true);
        setMonitoringEnabled(true);
        toast({
          title: "Focus Mode Active",
          description: "App monitoring automatically enabled during focus time",
        });
      } else if (!isTimerActive && focusMode) {
        setFocusMode(false);
        // Don't disable monitoring here, just update the state
      }
    };
    
    // Check initially
    checkFocusTimer();
    
    // Set up interval to check
    const interval = setInterval(checkFocusTimer, 5000);
    
    return () => clearInterval(interval);
  }, [focusMode, toast]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-8">
        <h1 className="text-2xl md:text-3xl text-purple-400 font-light flex items-center">
          <BrainCircuit className="mr-2 h-6 w-6" />
          AI Productivity Assistant
        </h1>
        
        <Tabs defaultValue="appMonitoring" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="appMonitoring">App Monitoring</TabsTrigger>
            <TabsTrigger value="dailyPlanner">Daily Planner</TabsTrigger>
          </TabsList>
          
          {/* App Monitoring Tab */}
          <TabsContent value="appMonitoring">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-black to-purple-900/70 border border-purple-500/30">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl text-purple-300">App Monitoring</h2>
                    {focusMode && (
                      <span className="ml-2 px-2 py-1 bg-purple-900/50 text-purple-300 rounded-md text-xs">
                        Focus Mode
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={monitoringEnabled}
                    onCheckedChange={toggleMonitoring}
                    disabled={focusMode}
                  />
                </div>
                
                <p className="text-white mb-6">
                  When enabled, AI will monitor your app usage and provide warnings when you're using unproductive apps.
                  {focusMode && " App monitoring is automatically enabled during focus time."}
                </p>
                
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm text-gray-300 mb-2">Monitored Apps:</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {blockedApps.map(app => (
                      <div key={app} className="flex items-center p-2 rounded-md bg-black/50">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm text-white">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={simulateAppDetection}
                  disabled={isLoading || !monitoringEnabled}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Analyzing..." : "Test App Detection"}
                </Button>
                
                {/* Privacy notice moved to bottom */}
                <Alert className="mt-6 bg-gradient-to-r from-black to-purple-900/50 border-purple-800/30">
                  <ShieldAlert className="h-4 w-4 text-white" />
                  <AlertTitle className="text-white">Privacy Notice</AlertTitle>
                  <AlertDescription className="text-white/80">
                    App detection happens entirely on your device. No app usage data is sent to our servers.
                  </AlertDescription>
                </Alert>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Daily Planner Tab */}
          <TabsContent value="dailyPlanner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-black to-purple-900/70 border border-purple-500/30">
                <div className="flex items-center mb-4">
                  <Calendar className="mr-2 h-5 w-5 text-purple-400" />
                  <h2 className="text-xl text-purple-300">AI Day Planner</h2>
                </div>
                
                <p className="text-white mb-6">
                  Let AI help you plan your day based on your tasks, energy level, and mood. The assistant will detect leftover tasks and suggest new ones tailored to your goals.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">How are you feeling today?</label>
                    <div className="flex gap-4 mb-4">
                      <Select value={userMood} onValueChange={setUserMood}>
                        <SelectTrigger className="bg-black/50 border-purple-800/30 text-white">
                          <SelectValue placeholder="Your mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="energetic">Energetic</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="tired">Tired</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={userEnergy} onValueChange={setUserEnergy}>
                        <SelectTrigger className="bg-black/50 border-purple-800/30 text-white">
                          <SelectValue placeholder="Energy level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Energy</SelectItem>
                          <SelectItem value="medium">Medium Energy</SelectItem>
                          <SelectItem value="low">Low Energy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">What would you like to accomplish today?</label>
                    <Textarea 
                      value={planInput}
                      onChange={(e) => setPlanInput(e.target.value)}
                      placeholder="E.g. I need to finish my project proposal, attend a team meeting, and respond to client emails."
                      className="bg-black/50 border-purple-800/30 text-white h-28"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={generateDailyPlan}
                  disabled={isLoading}
                  className="w-full mb-6 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Activity className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Generating Plan..." : "Generate My Day Plan"}
                </Button>
                
                {generatedPlan && (
                  <div className="mt-4 p-4 rounded-md bg-black/50 border border-purple-500/30">
                    <h3 className="text-lg text-purple-300 mb-3 flex items-center">
                      <Smile className="mr-2 h-4 w-4" /> Your Personalized Plan
                    </h3>
                    <div className="text-white whitespace-pre-line">
                      {generatedPlan}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        
        {/* How it works section */}
        <Card className="p-6 bg-gradient-to-br from-black to-purple-900/70 border border-purple-500/30">
          <h2 className="text-xl text-purple-300 mb-4">How It Works</h2>
          <ul className="space-y-3 text-white">
            <li className="flex items-start">
              <div className="bg-purple-900/30 rounded-full p-1 mr-2 mt-0.5">
                <span className="text-xs text-purple-300">1</span>
              </div>
              <span>AI monitors which apps you're currently using</span>
            </li>
            <li className="flex items-start">
              <div className="bg-purple-900/30 rounded-full p-1 mr-2 mt-0.5">
                <span className="text-xs text-purple-300">2</span>
              </div>
              <span>When unproductive apps are detected, you'll see a warning notification</span>
            </li>
            <li className="flex items-start">
              <div className="bg-purple-900/30 rounded-full p-1 mr-2 mt-0.5">
                <span className="text-xs text-purple-300">3</span>
              </div>
              <span>During Focus Time, monitoring is automatically enabled</span>
            </li>
            <li className="flex items-start">
              <div className="bg-purple-900/30 rounded-full p-1 mr-2 mt-0.5">
                <span className="text-xs text-purple-300">4</span>
              </div>
              <span>AI helps plan your day based on your mood, energy and goals</span>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
