
import React, { useState } from 'react';
import TypewriterEffect from './TypewriterEffect';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  
  const handleTypingComplete = () => {
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 600);
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="text-3xl text-xenon-primary font-light">
        <TypewriterEffect 
          text="xenon ai" 
          delay={150}
          onComplete={handleTypingComplete} 
        />
      </div>
    </div>
  );
};

export default SplashScreen;
