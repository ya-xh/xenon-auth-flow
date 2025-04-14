
import { useState, useEffect } from "react";
import { Maximize2, Minimize2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format hours, minutes and seconds
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50 bg-black/95 justify-center' : ''}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-2">
          <Clock className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="text-lg text-purple-400 font-medium">Current Time</h3>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
            onClick={toggleExpand}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className={`flex space-x-1 md:space-x-2 ${isExpanded ? 'scale-150 md:scale-200' : ''} transition-transform duration-300`}>
          {/* Hours */}
          <FlipUnit digit={hours.charAt(0)} />
          <FlipUnit digit={hours.charAt(1)} />
          
          <div className="text-2xl md:text-4xl text-purple-500 flex items-center font-mono">:</div>
          
          {/* Minutes */}
          <FlipUnit digit={minutes.charAt(0)} />
          <FlipUnit digit={minutes.charAt(1)} />
          
          <div className="text-2xl md:text-4xl text-purple-500 flex items-center font-mono">:</div>
          
          {/* Seconds */}
          <FlipUnit digit={seconds.charAt(0)} />
          <FlipUnit digit={seconds.charAt(1)} />
        </div>
        
        {isExpanded && (
          <Button
            variant="ghost"
            className="mt-8 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
            onClick={toggleExpand}
          >
            Return to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

// Single flip unit (digit)
const FlipUnit = ({ digit }: { digit: string }) => {
  return (
    <div className="relative flex flex-col justify-center items-center">
      <div className="w-8 h-12 md:w-12 md:h-16 bg-gray-900 border border-gray-700 rounded-md flex items-center justify-center overflow-hidden text-xl md:text-2xl text-white font-mono font-bold shadow-lg">
        {digit}
      </div>
      <div className="absolute h-[1px] w-full bg-gray-700 top-1/2 z-10"></div>
      <div className="absolute h-[1px] w-[6px] left-0 top-1/2 bg-gray-600 z-20"></div>
      <div className="absolute h-[1px] w-[6px] right-0 top-1/2 bg-gray-600 z-20"></div>
    </div>
  );
};

export default FlipClock;
