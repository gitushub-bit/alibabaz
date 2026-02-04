import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Sparkles,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your Alibaba Trade Assistant. I can help you find products, suppliers, or track your orders. What are you looking for today?",
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isTyping]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            let responseText = "I can help with that. Could you provide more details?";
            const lowerInput = userMsg.content.toLowerCase();

            if (lowerInput.includes('track') || lowerInput.includes('order')) {
                responseText = "You can track your orders in the 'My Orders' section. Would you like me to take you there?";
                // Note: In a real app, we could add a button here to navigate
            } else if (lowerInput.includes('supplier') || lowerInput.includes('sourcing')) {
                responseText = "We have thousands of verified suppliers. Try browsing our Global Industry Hubs or post a Request for Quotation (RFQ).";
            } else if (lowerInput.includes('price') || lowerInput.includes('cost')) {
                responseText = "Prices vary by quantity (MOQ). Buying in bulk usually ensures the best price. Check the product page for tiered pricing.";
            } else if (lowerInput.includes('shipping')) {
                responseText = "Shipping costs depend on the weight, dimensions, and destination. You can calculate shipping on the product detail page.";
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const QuickAction = ({ label, onClick }: { label: string, onClick: () => void }) => (
        <button
            onClick={onClick}
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
        >
            {label}
        </button>
    );

    return (
        <>
            {/* Floating Toggle Button */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-300",
                isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            )}>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-alibaba-orange hover:bg-alibaba-orangeHover text-white p-0 relative group"
                >
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <Bot className="h-7 w-7 transition-transform group-hover:scale-110" />
                </Button>
            </div>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-[350px] md:w-[380px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-10 pointer-events-none"
            )}
                style={{ maxHeight: 'calc(100vh - 100px)', height: '600px' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-alibaba-orange to-orange-600 p-4 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Trade Assistant</h3>
                            <p className="text-xs text-white/80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                        onClick={() => setIsOpen(false)}
                    >
                        <ChevronDown className="h-5 w-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 scroll-smooth"
                    ref={scrollRef}
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full items-end gap-2",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-alibaba-orange to-red-500 flex items-center justify-center shrink-0 shadow-sm">
                                    <Bot className="h-3.5 w-3.5 text-white" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[80%] px-4 py-2.5 shadow-sm text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-alibaba-orange text-white rounded-2xl rounded-tr-none"
                                        : "bg-card text-foreground border border-border rounded-2xl rounded-tl-none"
                                )}
                            >
                                {msg.content}
                                <div className={cn(
                                    "text-[10px] mt-1 opacity-70 text-right",
                                    msg.role === 'user' ? "text-white/80" : "text-muted-foreground"
                                )}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-end gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-alibaba-orange to-red-500 flex items-center justify-center shrink-0 shadow-sm">
                                <Bot className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions (visible if no typing) */}
                {!isTyping && messages.length < 3 && (
                    <div className="px-4 py-2 bg-background border-t border-border/50 flex gap-2 overflow-x-auto scrollbar-hide">
                        <QuickAction label="Sourcing Request" onClick={() => { setInputValue("I want to post a sourcing request"); handleSendMessage(); }} />
                        <QuickAction label="Track My Order" onClick={() => { navigate('/orders'); setIsOpen(false); }} />
                        <QuickAction label="Find Suppliers" onClick={() => { navigate('/products'); setIsOpen(false); }} />
                    </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-background border-t border-border">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border focus-within:border-primary/50 focus-within:bg-background transition-all"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || isTyping}
                            className={cn(
                                "rounded-full h-8 w-8 shrink-0 transition-all",
                                inputValue.trim() ? "bg-alibaba-orange hover:bg-alibaba-orangeHover" : "bg-muted text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};
