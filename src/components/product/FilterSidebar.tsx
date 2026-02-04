import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, Package } from "lucide-react";
import { RatingFilter } from "./RatingFilter";
import { LocationFilter } from "./LocationFilter";

interface FilterSidebarProps {
    categories: { id: string; name: string; slug: string }[];
    currentCategorySlug: string;
    onCategoryChange: (slug: string) => void;
    verifiedOnly: boolean;
    onVerifiedChange: (verified: boolean) => void;
    minPrice: string;
    maxPrice: string;
    onPriceChange: (min: string, max: string) => void;
    rating: number[];
    onRatingChange: (ratings: number[]) => void;
    locations: string[];
    onLocationsChange: (locations: string[]) => void;
    moqRange: string;
    onMoqChange: (range: string) => void;
}

export function FilterSidebar({
    categories,
    currentCategorySlug,
    onCategoryChange,
    verifiedOnly,
    onVerifiedChange,
    minPrice,
    maxPrice,
    onPriceChange,
    rating,
    onRatingChange,
    locations,
    onLocationsChange,
    moqRange,
    onMoqChange
}: FilterSidebarProps) {

    return (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                    <button
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategorySlug
                            ? 'bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                        onClick={() => onCategoryChange('')}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategorySlug === cat.slug
                                ? 'bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500'
                                : 'hover:bg-muted text-muted-foreground'
                                }`}
                            onClick={() => onCategoryChange(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Supplier Type */}
            <div>
                <h3 className="font-semibold mb-3 text-foreground">Supplier Features</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                            id="verified"
                            checked={verifiedOnly}
                            onCheckedChange={(checked) => onVerifiedChange(checked as boolean)}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <span className="text-sm group-hover:text-orange-600 transition-colors">Verified Suppliers</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Price Range */}
            <div>
                <h3 className="font-semibold mb-3 text-foreground">Price Range (USD)</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">$</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                            className="h-9 pl-5"
                        />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">$</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => onPriceChange(minPrice, e.target.value)}
                            className="h-9 pl-5"
                        />
                    </div>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-2 h-7 text-xs"
                    disabled={!minPrice && !maxPrice}
                    onClick={() => { }} // Inputs apply automatically in this setup, this is visual
                >
                    Apply Price
                </Button>
            </div>

            <div className="h-px bg-border/50" />

            {/* MOQ Range */}
            <div>
                <h3 className="font-semibold mb-3 text-foreground">Min. Order (MOQ)</h3>
                <div className="space-y-2">
                    {[
                        { label: "Less than 10 pieces", value: "0-10" },
                        { label: "10 - 50 pieces", value: "10-50" },
                        { label: "50 - 100 pieces", value: "50-100" },
                        { label: "100 - 500 pieces", value: "100-500" },
                        { label: "500+ pieces", value: "500-plus" },
                    ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                                type="radio"
                                name="moq"
                                checked={moqRange === option.value}
                                onChange={() => onMoqChange(moqRange === option.value ? "" : option.value)}
                                className="accent-orange-500 w-4 h-4"
                            />
                            <span className="text-sm text-gray-600">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Rating */}
            <RatingFilter
                selectedRatings={rating}
                onChange={onRatingChange}
            />

            <div className="h-px bg-border/50" />

            {/* Location */}
            <LocationFilter
                selectedLocations={locations}
                onChange={onLocationsChange}
            />

        </div>
    );
}
