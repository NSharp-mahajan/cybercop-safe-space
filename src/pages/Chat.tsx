import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, MessageCircle, Bot, User, Sparkles, Shield, Zap, Brain, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [user, setUser] = useState<any>(null);
  const [anonymousSession] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const sendMessage = async (messageText: string = message) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          chat_id: chat?.id,
          user_id: user?.id,
          message: messageText,
          anonymous_session: !user ? anonymousSession : undefined,
        },
      });

      if (error) throw error;

      // Refresh chat messages
      if (data.chat_id) {
        await loadChatMessages(data.chat_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;

      setChat({
        id: chatId,
        title: chatData.title || 'New Chat',
        messages: (messages || []).map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant'
        })),
      });
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    let quickMessage = '';
    switch (action) {
      case 'fir':
        quickMessage = 'How do I file an FIR?';
        break;
      case 'suspicious':
        quickMessage = 'I got a suspicious message, what should I do?';
        break;
      case 'url':
        quickMessage = 'How can I check if a URL is safe?';
        break;
    }
    if (quickMessage) {
      sendMessage(quickMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Clean Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                CyberCop AI Assistant
              </h1>
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 px-3 py-1 mt-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Get help with cyber safety, filing FIRs, reporting scams, and security guidance
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col bg-slate-800/50 border border-cyan-500/20 shadow-xl">
          <CardHeader className="pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  {chat?.title || 'New Conversation'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ask about filing FIRs, reporting scams, or general cyber safety
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 p-4">
              {!chat?.messages?.length ? (
                <div className="bg-slate-700/50 border border-cyan-500/20 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Welcome to CyberCop AI!
                    </h3>
                  </div>
                  <p className="text-slate-300 mb-6">
                    I'm here to help you with cybersecurity questions, filing FIRs, reporting scams, and general cyber safety guidance.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={() => handleQuickAction('fir')}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      How to file FIR
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('suspicious')}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Suspicious message
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('url')}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Check a URL
                    </Button>
                  </div>
                </div>
            ) : (
              chat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500' 
                        : 'bg-slate-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700/50 text-slate-100 border border-slate-600/50'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                      <div className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-cyan-100' : 'text-slate-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <span className="text-slate-200 text-sm">CyberCop AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-3">
              <Input
                placeholder="Ask me anything about cyber safety, FIRs, scams..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
                className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 rounded-lg"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !message.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ChatPage;