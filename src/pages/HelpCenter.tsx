import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    MessageCircle,
    Mail,
    Phone,
    HelpCircle,
    ShoppingCart,
    Package,
    CreditCard,
    Truck,
    FileText,
    Users,
    Shield,
    Send
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'Orders',
        question: 'How do I place an order?',
        answer: 'Browse products, add items to your inquiry basket, proceed to checkout, select shipping address, choose payment method, and confirm your order. You\'ll receive an order confirmation email with tracking details.'
    },
    {
        category: 'Orders',
        question: 'Can I modify or cancel my order?',
        answer: 'Orders can be modified or cancelled within 2 hours of placement if they haven\'t been processed. Contact the seller directly through the messaging system or reach out to our support team.'
    },
    {
        category: 'Orders',
        question: 'What is the minimum order quantity (MOQ)?',
        answer: 'Each product has its own MOQ set by the supplier. You can find this information on the product detail page. MOQs vary based on product type and supplier policies.'
    },
    {
        category: 'Shipping',
        question: 'How long does shipping take?',
        answer: 'Shipping times vary by supplier location and shipping method. Typical delivery times are 15-30 days for international orders and 3-7 days for domestic orders. Express shipping options are available for most products.'
    },
    {
        category: 'Shipping',
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order status in the "Orders" section of your account dashboard.'
    },
    {
        category: 'Shipping',
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to over 200 countries worldwide. Shipping costs and delivery times vary by destination. You can see estimated shipping costs during checkout.'
    },
    {
        category: 'Payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, bank transfers, and trade credit for verified business accounts. All payments are processed securely.'
    },
    {
        category: 'Payment',
        question: 'Is my payment information secure?',
        answer: 'Yes. We use industry-standard encryption and never store your full credit card details. All transactions are processed through PCI-compliant payment gateways.'
    },
    {
        category: 'Payment',
        question: 'Can I get an invoice for my purchase?',
        answer: 'Yes. Invoices are automatically generated and sent to your email after order confirmation. You can also download invoices from your order history.'
    },
    {
        category: 'Account',
        question: 'How do I create an account?',
        answer: 'Click "Sign In" in the header, then select "Create Account". Fill in your details, verify your email address, and you\'re ready to start sourcing products.'
    },
    {
        category: 'Account',
        question: 'I forgot my password. What should I do?',
        answer: 'Click "Sign In", then select "Forgot Password". Enter your email address and we\'ll send you a password reset link.'
    },
    {
        category: 'Account',
        question: 'How do I become a verified buyer?',
        answer: 'Complete your profile with business information, upload required documents (business license, tax ID), and our verification team will review your application within 2-3 business days.'
    },
    {
        category: 'Suppliers',
        question: 'How do I contact a supplier?',
        answer: 'Click the "Contact Supplier" button on any product page to send a direct message. You can also submit an RFQ (Request for Quotation) for bulk orders.'
    },
    {
        category: 'Suppliers',
        question: 'What does "Verified Supplier" mean?',
        answer: 'Verified suppliers have completed our authentication process, including business license verification, quality audits, and background checks. They meet our standards for reliability and product quality.'
    },
    {
        category: 'Suppliers',
        question: 'Can I negotiate prices with suppliers?',
        answer: 'Yes! Use the messaging system to negotiate prices, especially for bulk orders. Many suppliers offer volume discounts and are open to price discussions.'
    },
    {
        category: 'Returns',
        question: 'What is your return policy?',
        answer: 'Returns are accepted within 30 days of delivery for defective or incorrect items. Contact the supplier first to initiate a return. Refunds are processed within 5-7 business days after the return is approved.'
    },
    {
        category: 'Returns',
        question: 'Who pays for return shipping?',
        answer: 'For defective or incorrect items, the supplier covers return shipping. For buyer remorse or change of mind, the buyer is responsible for return shipping costs.'
    }
];

const categories = [
    { name: 'All Topics', icon: HelpCircle, value: 'all' },
    { name: 'Orders', icon: ShoppingCart, value: 'Orders' },
    { name: 'Shipping', icon: Truck, value: 'Shipping' },
    { name: 'Payment', icon: CreditCard, value: 'Payment' },
    { name: 'Account', icon: Users, value: 'Account' },
    { name: 'Suppliers', icon: Package, value: 'Suppliers' },
    { name: 'Returns', icon: FileText, value: 'Returns' }
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual contact form submission
        toast({
            title: 'Message sent!',
            description: 'Our support team will get back to you within 24 hours.'
        });
        setContactForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
            <Helmet>
                <title>Help Center - B2B Marketplace</title>
                <meta name="description" content="Find answers to common questions about ordering, shipping, payments, and more. Get help with your B2B sourcing needs." />
            </Helmet>

            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
                    <p className="text-muted-foreground text-lg mb-6">
                        Search our knowledge base or browse by category
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {categories.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat.value)}
                            className="gap-2"
                        >
                            <cat.icon className="h-4 w-4" />
                            {cat.name}
                        </Button>
                    ))}
                </div>

                <Tabs defaultValue="faq" className="max-w-6xl mx-auto">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="contact">Contact Us</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>

                    {/* FAQ Tab */}
                    <TabsContent value="faq">
                        {filteredFAQs.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search or browse all categories
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Accordion type="single" collapsible className="space-y-4">
                                {filteredFAQs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`item-${index}`}
                                        className="bg-card border rounded-lg px-6"
                                    >
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-start gap-3 text-left">
                                                <Badge variant="secondary" className="mt-1">
                                                    {faq.category}
                                                </Badge>
                                                <span className="font-medium">{faq.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground pt-2 pb-4">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send us a message</CardTitle>
                                    <CardDescription>
                                        Fill out the form below and we'll get back to you within 24 hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Name</label>
                                            <Input
                                                required
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Email</label>
                                            <Input
                                                required
                                                type="email"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Subject</label>
                                            <Input
                                                required
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Message</label>
                                            <Textarea
                                                required
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                placeholder="Describe your issue or question..."
                                                rows={6}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Contact Methods */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5" />
                                            Live Chat
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">
                                            Chat with our support team in real-time
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Available: Mon-Fri, 9AM-6PM EST
                                        </p>
                                        <Button variant="outline" className="w-full">
                                            Start Chat
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="h-5 w-5" />
                                            Email Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">
                                            Send us an email and we'll respond within 24 hours
                                        </p>
                                        <a
                                            href="mailto:support@example.com"
                                            className="text-primary hover:underline font-medium"
                                        >
                                            support@example.com
                                        </a>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Phone Support
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">
                                            Speak directly with our support team
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            US: +1 (555) 123-4567
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            International: +44 20 1234 5678
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Resources Tab */}
                    <TabsContent value="resources">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <Shield className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Buyer Protection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Learn about our buyer protection policies and how we keep your transactions safe.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <Package className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Sourcing Guide</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Best practices for finding reliable suppliers and negotiating better deals.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <FileText className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>RFQ Tutorial</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Step-by-step guide on how to create effective Request for Quotations.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <Truck className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Shipping Guide</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Understanding shipping methods, customs, and international logistics.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CreditCard className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Payment Methods</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Explore all available payment options and choose what works best for you.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <Users className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Seller Verification</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        How we verify suppliers and what the verification badges mean.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
