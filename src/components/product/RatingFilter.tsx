import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RatingFilterProps {
    selectedRatings: number[];
    onChange: (ratings: number[]) => void;
}

export function RatingFilter({ selectedRatings, onChange }: RatingFilterProps) {
    const handleRatingChange = (rating: number, checked: boolean) => {
        if (checked) {
            onChange([...selectedRatings, rating]);
        } else {
            onChange(selectedRatings.filter((r) => r !== rating));
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Rating</h3>
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                            id={`rating-${rating}`}
                            checked={selectedRatings.includes(rating)}
                            onCheckedChange={(checked) =>
                                handleRatingChange(rating, checked as boolean)
                            }
                        />
                        <Label
                            htmlFor={`rating-${rating}`}
                            className="flex items-center text-sm font-normal cursor-pointer"
                        >
                            <div className="flex items-center text-amber-500 mr-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-gray-200 fill-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-muted-foreground text-xs">& Up</span>
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
