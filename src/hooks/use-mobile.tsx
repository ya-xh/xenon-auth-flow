
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  // Initialize with window.innerWidth < 768 instead of false
  const [isMobile, setIsMobile] = useState(() => {
    // Initial check - runs server-side too
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Re-check on mount
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};
