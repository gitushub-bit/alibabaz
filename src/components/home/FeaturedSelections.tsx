import { Trophy, MessageSquare, Tag } from "lucide-react";

export const FeaturedSelections = () => {
    return (
        <div className="hidden sm:block mt-6 mb-8 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto">

                <div className="border border-[#e6e6e6] rounded-xl py-10 flex flex-col items-center hover:border-[#ccc] transition-colors cursor-pointer bg-white">
                    <Trophy className="h-8 w-8 text-[#222]" strokeWidth={1.5} />
                    <span className="mt-3 text-[13px] text-[#222]">Top ranking</span>
                </div>

                <div className="border border-[#e6e6e6] rounded-xl py-10 flex flex-col items-center hover:border-[#ccc] transition-colors cursor-pointer bg-white">
                    <MessageSquare className="h-8 w-8 text-[#222]" strokeWidth={1.5} />
                    <span className="mt-3 text-[13px] text-[#222]">New arrivals</span>
                </div>

                <div className="border border-[#e6e6e6] rounded-xl py-10 flex flex-col items-center hover:border-[#ccc] transition-colors cursor-pointer bg-white">
                    <Tag className="h-8 w-8 text-[#222]" strokeWidth={1.5} />
                    <span className="mt-3 text-[13px] text-[#222]">Top deals</span>
                </div>

            </div>
        </div>
    );
};
