
import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  delay = 100,
  onComplete 
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }
  }, [currentIndex, delay, isComplete, onComplete, text]);

  return (
    <div className="font-mono">
      <span className="inline-block">
        {currentText}
        <span className={`border-r-2 ml-1 ${isComplete ? 'border-transparent' : 'animate-blink border-xenon-primary'}`}>
          &nbsp;
        </span>
      </span>
    </div>
  );
};

export default TypewriterEffect;
