import { Button } from "@/components/ui/button";
import { Zap, Truck, TrendingUp, Clock, Percent } from "lucide-react";

interface QuickFiltersProps {
    onApply: (type: string) => void;
    activePreset?: string;
}

export function QuickFilters({ onApply, activePreset }: QuickFiltersProps) {
    const presets = [
        { id: 'verified', label: 'Verified Only', icon: Zap },
        { id: 'free_shipping', label: 'Free Shipping', icon: Truck },
        { id: 'new_arrivals', label: 'New Arrivals', icon: Clock },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'on_sale', label: 'On Sale', icon: Percent },
    ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {presets.map((preset) => {
                const Icon = preset.icon;
                const isActive = activePreset === preset.id;

                return (
                    <Button
                        key={preset.id}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onApply(preset.id)}
                        className={`rounded-full flex-shrink-0 h-8 text-xs ${isActive
                                ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                : "border-gray-200 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50"
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                        {preset.label}
                    </Button>
                );
            })}
        </div>
    );
}
