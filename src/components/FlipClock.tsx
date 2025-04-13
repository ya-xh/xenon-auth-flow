
import { useState, useEffect } from "react";

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  
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
  
  return (
    <div className="flex justify-center items-center">
      <div className="flex space-x-1 md:space-x-2">
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
