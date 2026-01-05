import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Send, Loader2, Bot, User } from 'lucide-react';
import { Product } from '../types';
import { analyzeInventory, chatWithInventory } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAnalystProps {
  products: Product[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ products }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      try {
        const result = await analyzeInventory(products);
        if (isMounted) setInsight(result);
      } catch (e) {
        if (isMounted) setInsight("Unable to generate insights at the moment.");
      } finally {
        if (isMounted) setLoadingInsight(false);
      }
    };
    fetchInsight();
    return () => { isMounted = false; };
  }, [products]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const response = await chatWithInventory(input, products);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6">
      
      {/* Left Column: Strategic Insights */}
      <div className="w-full md:w-1/2 flex flex-col gap-6 overflow-hidden">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            Inventory Intelligence
          </h2>
           <p className="text-slate-500">AI-driven strategic analysis of your stock.</p>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-y-auto">
          <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            Strategic Overview
          </h3>
          {loadingInsight ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p>Analyzing inventory data...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo text-slate-600">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interactive Chat */}
      <div className="w-full md:w-1/2 flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-[600px] md:h-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Ask the Inventory Assistant</h3>
            <p className="text-xs text-slate-500">e.g., "What ACs are low on stock?" or "Total value of Fridges?"</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                    <Bot className="w-12 h-12 mb-2 opacity-20" />
                    <p>Start chatting to query your inventory.</p>
                </div>
            )}
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                    )}
                    <div className={`
                        max-w-[80%] rounded-2xl px-4 py-2 text-sm
                        ${msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}
                    `}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-slate-600" />
                        </div>
                    )}
                </div>
            ))}
            {chatLoading && (
                <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                        <span className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button 
                type="submit"
                disabled={!input.trim() || chatLoading}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>

    </div>
  );
};

export default AIAnalyst;