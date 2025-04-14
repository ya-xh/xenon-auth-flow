
import React, { useState, useEffect } from "react";
import { Maximize2, Minimize2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevTime, setPrevTime] = useState({
    hours: time.getHours().toString().padStart(2, '0'),
    minutes: time.getMinutes().toString().padStart(2, '0'),
    seconds: time.getSeconds().toString().padStart(2, '0')
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setPrevTime({
        hours: time.getHours().toString().padStart(2, '0'),
        minutes: time.getMinutes().toString().padStart(2, '0'),
        seconds: time.getSeconds().toString().padStart(2, '0')
      });
      setTime(newTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [time]);
  
  // Format hours, minutes and seconds
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isExpanded ? 'fixed inset-0 z-50 bg-black/95 justify-center' : ''}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-4">
          <Clock className={`${isExpanded ? 'h-8 w-8' : 'h-5 w-5'} text-purple-400 mr-2 transition-all duration-300`} />
          <h3 className={`${isExpanded ? 'text-3xl' : 'text-lg'} text-purple-400 font-medium transition-all duration-300`}>Current Time</h3>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
            onClick={toggleExpand}
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className={`flex space-x-2 md:space-x-4 ${isExpanded ? 'scale-175 md:scale-250' : ''} transition-transform duration-500`}>
          {/* Hours */}
          <FlipUnit digit={hours.charAt(0)} prevDigit={prevTime.hours.charAt(0)} isExpanded={isExpanded} />
          <FlipUnit digit={hours.charAt(1)} prevDigit={prevTime.hours.charAt(1)} isExpanded={isExpanded} />
          
          <div className={`text-3xl md:text-5xl ${isExpanded ? 'text-4xl md:text-6xl' : ''} text-purple-500 flex items-center font-mono transition-all duration-300`}>:</div>
          
          {/* Minutes */}
          <FlipUnit digit={minutes.charAt(0)} prevDigit={prevTime.minutes.charAt(0)} isExpanded={isExpanded} />
          <FlipUnit digit={minutes.charAt(1)} prevDigit={prevTime.minutes.charAt(1)} isExpanded={isExpanded} />
          
          <div className={`text-3xl md:text-5xl ${isExpanded ? 'text-4xl md:text-6xl' : ''} text-purple-500 flex items-center font-mono transition-all duration-300`}>:</div>
          
          {/* Seconds */}
          <FlipUnit digit={seconds.charAt(0)} prevDigit={prevTime.seconds.charAt(0)} isExpanded={isExpanded} />
          <FlipUnit digit={seconds.charAt(1)} prevDigit={prevTime.seconds.charAt(1)} isExpanded={isExpanded} />
        </div>
        
        {isExpanded && (
          <Button
            variant="ghost"
            className="mt-12 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
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
const FlipUnit = ({ digit, prevDigit, isExpanded }) => {
  const hasChanged = digit !== prevDigit;
  
  const unitSize = isExpanded 
    ? { width: "w-16 md:w-24", height: "h-24 md:h-32", fontSize: "text-4xl md:text-5xl" }
    : { width: "w-10 md:w-14", height: "h-16 md:h-20", fontSize: "text-2xl md:text-3xl" };
  
  return (
    <div className={`relative flex flex-col justify-center items-center transition-all duration-300`}>
      <div className={`${unitSize.width} ${unitSize.height} bg-gray-900 border border-gray-700 rounded-md flex items-center justify-center overflow-hidden ${unitSize.fontSize} text-white font-mono font-bold shadow-lg relative`}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={digit}
            className="absolute inset-0 flex items-center justify-center"
            initial={hasChanged ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {digit}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute h-[1px] w-full bg-gray-700 top-1/2 z-10"></div>
      <div className="absolute h-[1px] w-[6px] left-0 top-1/2 bg-gray-600 z-20"></div>
      <div className="absolute h-[1px] w-[6px] right-0 top-1/2 bg-gray-600 z-20"></div>
    </div>
  );
};

export default FlipClock;
