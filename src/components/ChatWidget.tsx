import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
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

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">CyberCop AI</CardTitle>
          <CardDescription className="text-sm">
            Ask about cyber safety, FIRs, and scams
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {!chat?.messages?.length ? (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ask about filing FIRs, reporting scams, or general cyber safety. Type naturally.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('fir')}
                  className="text-xs h-7"
                >
                  How to file FIR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('suspicious')}
                  className="text-xs h-7"
                >
                  I got suspicious message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('url')}
                  className="text-xs h-7"
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
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-2'
                      : 'bg-muted mr-2'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg mr-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
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
  );
};

export default ChatWidget;