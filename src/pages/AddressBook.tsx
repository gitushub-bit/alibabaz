

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, Lock, ChevronDown, MapPin, HelpCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AddressBook() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('action') === 'add') {
            setIsModalOpen(true);
        }
    }, [location.search]);

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* 1. Header (Simplistic for this page) */}
            <header className="w-full border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-4 md:px-0 h-[72px] flex items-center">
                    <img
                        src={logo}
                        alt="Alibaba.com"
                        className="h-[40px] md:h-[48px] object-contain cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                </div>
            </header>

            {/* 2. Main Content */}
            <main className="flex-1 flex flex-col items-center pt-10 md:pt-16 pb-20 px-4">

                {/* Page Title */}
                <div className="max-w-[1200px] w-full mb-12 md:mb-20">
                    <h1 className="text-[24px] font-bold text-[#111]">Address book</h1>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center text-center max-w-md">

                    {/* Illustration Placeholder */}
                    <div className="mb-6 relative">
                        <img src="https://placehold.co/220x160/orange/white?text=No+Addresses" alt="Empty State" className="opacity-80 mix-blend-multiply" />
                    </div>

                    <h2 className="text-[16px] font-bold text-[#111] mb-2">
                        No addresses saved yet.
                    </h2>
                    <p className="text-[13px] text-[#666] mb-8">
                        Once you've added an address, it will be saved here.
                    </p>

                    <button
                        className="border border-[#111] text-[#111] rounded-full px-12 py-2.5 text-[15px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 group"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} strokeWidth={3} className="text-[#111]" />
                        <span>Add an address</span>
                    </button>
                </div>
            </main>

            {/* 3. Footer */}
            <footer className="w-full py-8 border-t border-gray-100 mt-auto">
                <div className="text-center">
                    <div className="text-[12px] text-[#666] space-x-2 mb-2">
                        <span className="cursor-pointer hover:underline">AliExpress</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">1688.com</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">Tmall Taobao World</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">Alipay</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">Lazada</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">Taobao Global</span>
                    </div>
                    <div className="text-[12px] text-[#999]">
                        Browse Alphabetically: Onetouch | Country Search | Affiliate
                    </div>
                    <div className="text-[12px] text-[#999] mt-2">
                        Product Listing Policy - Intellectual Property Protection - Privacy Policy - Terms of Use - User Information Legal Enquiry Guide
                    </div>
                    <div className="text-[12px] text-[#999] mt-2">
                        © 1999-{new Date().getFullYear()} Alibaba.com. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Add Address Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[700px] p-0 rounded-2xl overflow-hidden gap-0">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-2">
                        <h2 className="text-[20px] font-bold text-[#111]">Add address</h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                            {/* X Icon provided by DialogClose usually, but standard X here */}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center gap-1.5 mb-6 text-[#00A651]">
                            <Lock size={14} />
                            <span className="text-[13px]">Your information is encrypted and secure</span>
                        </div>

                        <div className="space-y-4">
                            {/* Country */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-[#666]">Country / region <span className="text-red-500">*</span></label>
                                <div className="border border-gray-300 rounded-[4px] px-3 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#FF6600]">
                                    <div className="flex items-center gap-2">
                                        <img src="https://flagcdn.com/w20/ke.png" alt="Kenya" className="w-5 h-3.5 object-cover rounded-[1px]" />
                                        <span className="text-[14px] text-[#111]">Kenya</span>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Name & Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-[#666]">First name and Last name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        defaultValue="Brian Broadways"
                                        className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-[#666]">Phone number <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <div className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] w-[70px] flex items-center justify-center bg-gray-50 text-gray-500">
                                            +254
                                        </div>
                                        <input
                                            type="text"
                                            className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] flex-1"
                                        />
                                    </div>
                                    <p className="text-[11px] text-[#999]">Only used to contact you for delivery updates</p>
                                </div>
                            </div>

                            {/* Street Address */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-[#666]">Street address or P.O. box <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full pr-[180px]"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer text-[#333] hover:text-[#FF6600] transition-colors">
                                        <MapPin size={14} />
                                        <span className="text-[13px] underline">Use my current location</span>
                                    </div>
                                </div>
                            </div>

                            {/* Apartment */}
                            <div className="flex flex-col gap-1.5">
                                <input
                                    type="text"
                                    placeholder="Apartment, suite, unit, building, floor (optional)"
                                    className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full"
                                />
                            </div>

                            {/* Location Details */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-[#666]">State / province <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-[#666]">City <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] text-[#666]">Postal code <span className="text-red-500">*</span></label>
                                        <HelpCircle size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] w-full"
                                    />
                                </div>
                            </div>

                            {/* Default Checkbox */}
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="default-addr" className="w-4 h-4 rounded border-gray-300 accent-[#FF6600]" />
                                <label htmlFor="default-addr" className="text-[13px] text-[#333]">Set as default shipping address</label>
                            </div>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                        <Button
                            variant="outline"
                            className="rounded-full px-8 h-[36px] border-gray-300 text-[#333] hover:bg-gray-50 font-medium"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-full px-8 h-[36px] bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Submit
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
}
