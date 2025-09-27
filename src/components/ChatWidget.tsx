import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/lib/hooks';
import { supabase } from '@/integrations/supabase/client';
import { mockChatService } from '@/services/mockChatService';

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
      // Try Supabase Edge Function first
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
      console.log('Supabase function failed, using mock service:', error);
      
      // Fallback to mock service for local development
      try {
        const mockResponse = await mockChatService.sendMessage({
          chat_id: chat?.id,
          user_id: user?.id,
          message: messageText,
          anonymous_session: !user ? anonymousSession : undefined,
        });

        // Create a mock chat if none exists
        if (!chat) {
          const mockChat = {
            id: mockResponse.chat_id,
            title: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
            messages: []
          };
          setChat(mockChat);
        }

        // Add user message
        const userMessage = {
          id: crypto.randomUUID(),
          message: messageText,
          role: 'user' as const,
          created_at: new Date().toISOString()
        };

        // Add assistant response
        const assistantMessage = {
          id: crypto.randomUUID(),
          message: mockResponse.message,
          role: 'assistant' as const,
          created_at: new Date().toISOString()
        };

        setChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, userMessage, assistantMessage]
        } : {
          id: mockResponse.chat_id,
          title: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          messages: [userMessage, assistantMessage]
        });

      } catch (mockError) {
        console.error('Mock service error:', mockError);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
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
      <div className="chat-widget-container">
        <Button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button rounded-full w-14 h-14 shadow-lg gradient-primary"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="chat-widget-container">
      <Card className="w-80 sm:w-96 h-[30rem] max-h-[calc(100vh-4rem)] shadow-2xl flex flex-col border-primary/20 glow-primary backdrop-blur-sm">
        <CardHeader className="chat-header flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
          <div>
            <CardTitle className="text-lg font-bold text-primary">CyberCop AI</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Your cyber safety assistant 🛡️
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-primary/10 transition-colors rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      
      <CardContent className="chat-content p-0 min-h-0 flex flex-col" style={{ overflow: 'hidden', width: '100%' }}>
        <div className="chat-messages chat-messages-container p-4 space-y-4 flex-1 overflow-y-auto" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full mb-4`}
                style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}
              >
                <div
                  className={`chat-bubble p-3 text-sm ${
                    msg.role === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-assistant'
                  }`}
                  style={{
                    maxWidth: '75%',
                    minWidth: '60px',
                    width: 'fit-content',
                    wordWrap: 'break-word',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    contain: 'layout style'
                  }}
                >
                  <div
                    className="chat-bubble-text"
                    style={{
                      wordWrap: 'break-word',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      display: 'block',
                      minWidth: 0,
                      hyphens: 'auto'
                    }}
                  >
                    {msg.message}
                  </div>
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

          <div className="flex gap-2 p-4 border-t border-primary/20 flex-shrink-0 bg-gradient-to-r from-background/50 to-muted/20 backdrop-blur-sm">
            <Input
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="chat-input flex-1 rounded-full border-primary/20 focus:border-primary/50 focus:ring-primary/20 bg-background/80"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !message.trim()}
              size="icon"
              className="chat-send-button rounded-full w-10 h-10 glow-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWidget;