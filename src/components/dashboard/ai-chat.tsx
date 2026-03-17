'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  X,
  Send,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Target,
} from 'lucide-react';
import { useUIStore, useAIChatStore } from '@/lib/store';

const suggestedQueries = [
  "What was our revenue yesterday?",
  "Which brand has the highest ROAS?",
  "Show me the worst performing product",
  "Compare Shopee vs Shopify performance",
  "Why did revenue drop last week?",
];

export function AIChatPanel() {
  const { aiChatOpen, toggleAIChat } = useUIStore();
  const { messages, isLoading, addMessage, updateLastMessage, setLoading } = useAIChatStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    // Add a placeholder for the assistant response
    addMessage({ role: 'assistant', content: '', loading: true });

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      updateLastMessage(data.response);
    } catch (error) {
      updateLastMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  if (!aiChatOpen) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-96 border-l bg-card shadow-xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask anything about your data</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAIChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h4 className="font-medium mb-2">Ask me anything</h4>
              <p className="text-sm text-muted-foreground mb-4">
                I can help you analyze your business data
              </p>
              <div className="space-y-2 w-full">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuery(query)}
                    className="w-full text-left text-sm p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    )}
                  >
                    {message.role === 'user' ? 'U' : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[280px]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
