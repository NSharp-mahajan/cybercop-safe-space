import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, MessageCircle } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <MessageCircle className="h-8 w-8" />
          CyberCop AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get help with cyber safety, filing FIRs, reporting scams, and more
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            {chat?.title || 'New Conversation'}
          </CardTitle>
          <CardDescription>
            Ask about filing FIRs, reporting scams, or general cyber safety. Type naturally.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {!chat?.messages?.length ? (
              <div className="bg-muted p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-3">Welcome to CyberCop AI!</h3>
                <p className="text-muted-foreground mb-4">
                  I'm here to help you with cybersecurity questions, filing FIRs, reporting scams, and general cyber safety guidance.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('fir')}
                  >
                    How to file FIR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('suspicious')}
                  >
                    I got suspicious message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('url')}
                  >
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
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg mr-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>CyberCop AI is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about cyber safety, FIRs, scams..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !message.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;