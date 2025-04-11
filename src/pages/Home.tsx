
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function HomePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: `Hello${user ? " " + user.email.split("@")[0] : ""}! How can I help you today?`,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: generateId(),
      content: input.trim(),
      role: "user" as const,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const responses = [
        "I'm Xenon, your AI assistant. I can help you with information, answering questions, and more.",
        "That's an interesting question. While I don't have real-time data, I can certainly help you explore this topic based on what I know.",
        "I'm designed to be helpful, harmless, and honest in my interactions. How else can I assist you today?",
        "Let me think about that... Based on my knowledge, here's what I understand about your question.",
        "Thanks for asking! I'm here to provide information and assistance on a wide range of topics.",
      ];
      
      const aiMessage = {
        id: generateId(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: "assistant" as const,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-xenon-primary text-white rounded-tr-none"
                    : "bg-gray-800/60 text-white rounded-tl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/60 text-white rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Xenon is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Xenon..."
              className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-xenon-primary hover:bg-xenon-secondary"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Xenon AI is in demo mode. Responses are simulated.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
