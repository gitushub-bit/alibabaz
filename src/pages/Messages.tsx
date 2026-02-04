import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AlibabaHeader from '@/components/layout/AlibabaHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Package,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  last_message_at: string;
  unread_count?: number;
  other_user?: {
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    verified?: boolean;
    location?: string;
  };
  product?: {
    id: string;
    title: string;
    image?: string;
    price?: string;
    slug?: string;
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
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

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

      // Update unread count locally when entering conversation
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));

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
            setMessages((prev) => {
              // Avoid duplicate messages from broadcast
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Mark as read if not sender
            if (newMsg.sender_id !== user.id) {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMsg.id)
                .then();
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, buyer_id, seller_id, product_id, last_message_at,
          products (id, title, images, price_min, price_max, slug)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const enrichedConversations = await Promise.all(
          data.map(async (conv) => {
            const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

            // Fetch profile and supplier info
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, company_name, avatar_url, country')
              .eq('user_id', otherUserId)
              .maybeSingle();

            const { data: supplier } = await supabase
              .from('suppliers')
              .select('verified')
              .eq('user_id', otherUserId)
              .maybeSingle();

            // Get last message
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at, read')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Count unread
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('read', false)
              .neq('sender_id', user.id);

            const productsData = conv.products as any;

            return {
              ...conv,
              other_user: {
                ...profile,
                verified: supplier?.verified || false,
                location: profile?.country || 'Global'
              },
              product: productsData ? {
                id: productsData.id,
                title: productsData.title,
                image: productsData.images?.[0],
                price: productsData.price_min ? `$${productsData.price_min}` : 'Contact'
              } : undefined,
              last_message: lastMsg?.content,
              unread_count: unreadCount || 0
            };
          })
        );

        setConversations(enrichedConversations as Conversation[]);

        if (conversationId) {
          const current = enrichedConversations.find(c => c.id === conversationId);
          setCurrentConversation(current as Conversation || null);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
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
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content
      });

      if (error) throw error;

      // Update conversation timestamp for sorting
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Re-fetch conversations to update the sidebar order
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredConversations = conversations.filter(c =>
    c.other_user?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AlibabaHeader />
        <div className="max-w-[1440px] mx-auto p-4 md:p-6">
          <Skeleton className="h-[700px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F5F7] flex flex-col overflow-hidden">
      <AlibabaHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto md:px-6 md:py-6 flex overflow-hidden">
        {/* ─── SIDEBAR: CONVERSATION LIST ─── */}
        <aside className={cn(
          "bg-white w-full md:w-[380px] flex-shrink-0 flex flex-col md:rounded-l-2xl border-r",
          conversationId ? "hidden md:flex" : "flex"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-extrabold text-[#111] mb-4">Message Center</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                className="pl-10 h-10 bg-gray-50 border-none rounded-xl focus-visible:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No conversations found</p>
                <Link to="/products" className="text-orange-600 font-bold text-sm mt-2 inline-block">Browse Products</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/messages/${conv.id}`}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                      conversationId === conv.id && "bg-orange-50/50 border-l-4 border-orange-500"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-sm">
                        <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                          {conv.other_user?.company_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 truncate pr-2">
                          {conv.other_user?.company_name || conv.other_user?.full_name || 'Global Partner'}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-tighter">
                          {formatMessageTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {conv.other_user?.verified && <ShieldCheck className="w-3 h-3 text-orange-500" />}
                        <span className="text-[11px] text-gray-400 font-bold truncate">Project: {conv.product?.title || 'General Inquiry'}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1 font-medium">
                        {conv.last_message || 'Start a new conversation...'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ─── MAIN CHAT AREA ─── */}
        <section className={cn(
          "bg-white flex-1 flex flex-col md:rounded-r-2xl relative",
          !conversationId && "hidden md:flex justify-center items-center"
        )}>
          {!conversationId ? (
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-[#F8F9FA] rounded-[40px] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                <MessageCircle className="w-12 h-12 text-[#FF6600]" />
              </div>
              <h2 className="text-2xl font-black text-[#111] mb-2 tracking-tight">Select a Supplier</h2>
              <p className="text-gray-500 max-w-xs mx-auto font-medium">Choose a conversation from the left to start business negotiations.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[72px] border-b px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => navigate('/messages')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={currentConversation?.other_user?.avatar_url || undefined} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                        {currentConversation?.other_user?.company_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate">
                          {currentConversation?.other_user?.company_name || 'Supplier'}
                        </h3>
                        {currentConversation?.other_user?.verified && <Badge className="bg-orange-50 text-orange-600 border-none h-4 px-1 text-[8px] font-black">PRO</Badge>}
                      </div>
                      <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Online now
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#FF6600]"><Phone className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#FF6600]"><Video className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#FF6600]"><Info className="w-5 h-5" /></Button>
                </div>
              </div>

              {/* Product Info Bar */}
              {currentConversation?.product && (
                <div className="bg-[#F8F9FA] border-b p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={currentConversation.product.image || '/placeholder.svg'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{currentConversation.product.title}</h4>
                      <p className="text-[10px] font-black text-orange-600">{currentConversation.product.price}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 rounded-full text-[10px] font-black border-2 border-gray-200"
                  >
                    <Link to={`/product/${currentConversation.product.slug || currentConversation.product.id}`}>VIEW PRODUCT</Link>
                  </Button>
                </div>
              )}

              {/* Messages Content */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200"
              >
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-[60%] rounded-2xl" />
                    <Skeleton className="h-10 w-[40%] rounded-2xl" />
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                        Negotiation Started
                      </span>
                    </div>

                    {messages.map((message, idx) => {
                      const isMine = message.sender_id === user?.id;
                      const showTime = idx === 0 ||
                        new Date(message.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 1800000;

                      return (
                        <div key={message.id} className="space-y-2">
                          {showTime && (
                            <div className="text-center py-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                            </div>
                          )}
                          <div className={cn("flex", isMine ? "justify-end" : "justify-start group")}>
                            <div className={cn(
                              "max-w-[85%] sm:max-w-[70%] space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                              isMine ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "px-4 py-3 shadow-sm",
                                isMine
                                  ? "bg-gradient-to-br from-[#FF6600] to-[#FF8800] text-white rounded-2xl rounded-tr-none"
                                  : "bg-[#F0F2F5] text-[#111] rounded-2xl rounded-tl-none font-medium"
                              )}>
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div className={cn("flex items-center gap-1", isMine ? "justify-end" : "justify-start")}>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                  {format(new Date(message.created_at), 'HH:mm')}
                                </span>
                                {isMine && (
                                  message.read
                                    ? <CheckCheck className="w-3 h-3 text-blue-500" />
                                    : <Check className="w-3 h-3 text-gray-300" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t flex-shrink-0">
                <div className="flex items-end gap-2 max-w-5xl mx-auto">
                  <div className="flex-1 relative bg-gray-100 rounded-2xl p-1 pr-2">
                    <textarea
                      placeholder="Discuss price, MOQ, shipping..."
                      className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-3 pr-10 min-h-[48px] max-h-32 text-sm font-medium"
                      rows={1}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="absolute right-2 bottom-2 h-8 w-8 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] transition-all transform hover:scale-105"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 px-2 overflow-x-auto no-scrollbar">
                  {['Send Sample Request', 'Inquire MOQ', 'Ask about Shipping', 'Request Catalog'].map(tip => (
                    <button
                      key={tip}
                      className="whitespace-nowrap text-[10px] font-black uppercase text-gray-400 hover:text-orange-600 transition-colors bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-full border border-gray-100"
                      onClick={() => setNewMessage(tip)}
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
