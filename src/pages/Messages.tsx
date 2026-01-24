import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  last_message_at: string;
  other_user?: {
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  product?: {
    title: string;
  };
  last_message?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages(conversationId);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            
            // Mark as read if not sender
            if (newMsg.sender_id !== user.id) {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMsg.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        id, buyer_id, seller_id, product_id, last_message_at,
        products (title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (data) {
      // Fetch other user info for each conversation
      const enrichedConversations = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();
          
          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            other_user: profile,
            product: conv.products,
            last_message: lastMsg?.content
          };
        })
      );

      setConversations(enrichedConversations as Conversation[]);
      
      // Set current conversation if in detail view
      if (conversationId) {
        const current = enrichedConversations.find(c => c.id === conversationId);
        setCurrentConversation(current as Conversation || null);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      
      // Mark unread messages as read
      const unreadIds = data
        .filter(m => !m.read && m.sender_id !== user?.id)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    });

    if (!error) {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    setSending(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Skeleton className="h-[600px] rounded-lg" />
        </main>
      </div>
    );
  }

  // Conversation detail view
  if (conversationId && currentConversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentConversation.other_user?.avatar_url || undefined} />
              <AvatarFallback>
                {currentConversation.other_user?.company_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {currentConversation.other_user?.company_name || currentConversation.other_user?.full_name || 'User'}
              </p>
              {currentConversation.product && (
                <p className="text-sm text-muted-foreground">
                  Re: {currentConversation.product.title}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-4 space-y-4 max-w-3xl">
            {messages.map((message) => {
              const isMine = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <div className="border-t bg-background p-4 sticky bottom-16 md:bottom-0">
          <div className="container mx-auto max-w-3xl flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Conversation list view
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start a conversation by contacting a supplier
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {conv.other_user?.company_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conv.other_user?.company_name || conv.other_user?.full_name || 'User'}
                  </p>
                  {conv.product && (
                    <p className="text-sm text-primary truncate">
                      Re: {conv.product.title}
                    </p>
                  )}
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(conv.last_message_at), 'MMM d')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
