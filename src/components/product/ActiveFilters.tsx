import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveFiltersProps {
    filters: {
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        verified?: boolean;
        rating?: number[];
        locations?: string[];
        query?: string;
    };
    onRemove: (key: string, value?: any) => void;
    onClearAll: () => void;
    categories?: { id: string; name: string; slug: string }[];
}

export function ActiveFilters({ filters, onRemove, onClearAll, categories = [] }: ActiveFiltersProps) {
    const hasActiveFilters =
        filters.category ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.verified ||
        (filters.rating && filters.rating.length > 0) ||
        (filters.locations && filters.locations.length > 0) ||
        filters.query;

    if (!hasActiveFilters) return null;

    const getCategoryName = (slug: string) => {
        return categories.find(c => c.slug === slug)?.name || slug;
    };

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground mr-1">Active filters:</span>

            {filters.query && (
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 gap-1 pl-2 pr-1 py-1">
                    Search: {filters.query}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-orange-200/50"
                        onClick={() => onRemove('query')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            {filters.category && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    Category: {getCategoryName(filters.category)}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => onRemove('category')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    Price: {filters.minPrice ? `$${filters.minPrice}` : '$0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => onRemove('price')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            {filters.verified && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    Verified Supplier
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => onRemove('verified')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            {filters.rating && filters.rating.length > 0 && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    Rating: {filters.rating.join(', ')} Stars
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => onRemove('rating')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            {filters.locations && filters.locations.length > 0 && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    Location: {filters.locations.join(', ')}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => onRemove('locations')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
                onClick={onClearAll}
            >
                Clear all
            </Button>
        </div>
    );
}
