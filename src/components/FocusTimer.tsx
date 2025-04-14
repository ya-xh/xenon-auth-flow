
import { useState, useEffect } from "react";
import { Play, Pause, StopCircle, Timer, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FocusTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [focusGoal, setFocusGoal] = useState<number | null>(null);
  const [notified, setNotified] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch user's daily focus goal
  useEffect(() => {
    const fetchFocusGoal = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('focus_hours')
          .eq('id', user.id)
          .single();
        
        if (data && data.focus_hours) {
          setFocusGoal(data.focus_hours * 3600); // Convert hours to seconds
        }
      } else {
        // For guest users, get from localStorage
        const storedHours = localStorage.getItem('xenon_focus_hours');
        if (storedHours) {
          setFocusGoal(parseInt(storedHours) * 3600); // Convert hours to seconds
        }
      }
    };
    
    fetchFocusGoal();
  }, [user]);
  
  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Check if we've reached 1 hour milestone and haven't notified yet
          if (newSeconds % 3600 === 0 && newSeconds > 0 && !notified) {
            toast({
              title: "Time for a break?",
              description: "You've been focusing for an hour. Consider taking a short break.",
              duration: 10000,
            });
            setNotified(true);
            // Reset notification flag after 5 minutes
            setTimeout(() => setNotified(false), 300000);
          }
          
          // Check if we've reached the daily focus goal
          if (focusGoal && newSeconds >= focusGoal) {
            toast({
              title: "Congratulations! 🎉",
              description: `You've completed your daily focus goal of ${focusGoal/3600} hours!`,
              duration: 10000,
            });
          }
          
          return newSeconds;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, focusGoal, notified, toast]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    if (!isRunning) {
      toast({
        title: "Focus time started",
        description: "Stay focused and productive!",
      });
    }
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };
  
  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };
  
  const calculateProgress = () => {
    if (!focusGoal) return 0;
    return Math.min(100, (seconds / focusGoal) * 100);
  };
  
  return (
    <div className="w-full max-w-md bg-gray-900/30 p-4 rounded-lg border border-gray-800">
      <div className="flex items-center mb-4">
        <Timer className="text-purple-400 mr-2" />
        <h2 className="text-xl text-purple-400 font-semibold">Focus Timer</h2>
      </div>
      
      <div className="text-4xl font-mono text-center mb-4 text-white">
        {formatTime(seconds)}
      </div>
      
      <div className="flex justify-center space-x-3 mb-4">
        <Button 
          onClick={toggleTimer} 
          variant="outline"
          className="bg-purple-600/10 border-purple-600/30 text-purple-400 hover:bg-purple-600/20"
        >
          {isRunning ? <Pause className="mr-1" /> : <Play className="mr-1" />}
          {isRunning ? "Pause" : "Start Focus"}
        </Button>
        
        <Button 
          onClick={resetTimer} 
          variant="outline"
          className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <StopCircle className="mr-1" />
          Reset
        </Button>
      </div>
      
      {focusGoal && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Daily Progress</span>
            <span>{Math.floor(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-gray-800" />
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(seconds)} / {formatTime(focusGoal)}
          </p>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;
