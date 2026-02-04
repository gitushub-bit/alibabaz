import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AlibabaHeader from '@/components/layout/AlibabaHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, Star, MessageSquare, ChevronRight, Award, ShieldCheck } from 'lucide-react';

interface Supplier {
    user_id: string;
    verified: boolean;
    response_rate: number;
    profile: {
        company_name: string | null;
        country: string | null;
        avatar_url: string | null;
    };
}

export default function Suppliers() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select(`
          user_id,
          verified,
          response_rate,
          profile:profiles(company_name, country, avatar_url)
        `)
                .limit(20);

            if (data) {
                setSuppliers(data as any);
            }
        } catch (err) {
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-20">
            <AlibabaHeader />

            <div className="bg-white border-b">
                <div className="max-w-[1440px] mx-auto px-4 py-8">
                    <h1 className="text-3xl font-extrabold text-[#111]">Verified Suppliers</h1>
                    <p className="text-gray-500 mt-2">Connect with manufacturers and professional trading companies worldwide.</p>
                </div>
            </div>

            <main className="max-w-[1440px] mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suppliers.map((s) => (
                            <Card
                                key={s.user_id}
                                className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl overflow-hidden group"
                                onClick={() => navigate(`/supplier/${s.user_id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden shrink-0 border border-gray-100">
                                            {s.profile?.avatar_url ? (
                                                <img src={s.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                s.profile?.company_name?.[0] || 'S'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-[#FF6600] transition-colors">
                                                    {s.profile?.company_name || 'Global Supplier'}
                                                </h3>
                                                {s.verified && <ShieldCheck className="w-4 h-4 text-orange-500" />}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.profile?.country || 'International'}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-green-600">{s.response_rate || 95}% Response</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[#FF6600] font-bold text-xs hover:bg-orange-50 p-0 h-auto">
                                            View Profile <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
