
import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Fixed set of inspirational quotes
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

const MotivationalQuote = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Get quote of the day
  useEffect(() => {
    const fetchQuote = () => {
      setIsLoading(true);
      
      // Check if we need a new quote
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem('xenon_quote_date');
      const storedQuote = localStorage.getItem('xenon_quote');
      
      // If we have a stored quote from today, use it
      if (storedQuote && storedDate === today) {
        try {
          setQuote(JSON.parse(storedQuote));
          setLastUpdated(storedDate);
        } catch (e) {
          console.error("Error parsing stored quote:", e);
          generateNewQuote(today);
        }
      } else {
        // Generate a new quote
        generateNewQuote(today);
      }
      
      setIsLoading(false);
    };
    
    fetchQuote();
  }, []);
  
  // Generate a new random quote
  const generateNewQuote = (dateStr: string) => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const newQuote = QUOTES[randomIndex];
    
    setQuote(newQuote);
    setLastUpdated(dateStr);
    
    // Store in localStorage
    localStorage.setItem('xenon_quote', JSON.stringify(newQuote));
    localStorage.setItem('xenon_quote_date', dateStr);
  };
  
  // Force refresh the quote
  const refreshQuote = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const today = new Date().toDateString();
      generateNewQuote(today);
      setIsLoading(false);
    }, 600);
  };

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Quote className="text-purple-400 mr-2" size={20} />
        <h2 className="text-xl text-purple-400 font-semibold">Daily Inspiration</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          onClick={refreshQuote}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-full bg-purple-800/20" />
          <Skeleton className="h-6 w-3/4 bg-purple-800/20" />
          <Skeleton className="h-4 w-1/3 bg-purple-800/20 mt-4" />
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-200 text-lg italic">{quote.text}</p>
          <p className="text-purple-300 mt-4 text-sm">— {quote.author}</p>
        </div>
      )}
      
      {lastUpdated && (
        <p className="text-gray-500 text-xs mt-4 text-right">
          Updated {new Date(lastUpdated).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
};

export default MotivationalQuote;
