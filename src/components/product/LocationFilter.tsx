import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countries } from "@/data/countries"; // Assuming we have this, otherwise we'll mock or import from somewhere else. 
// If countries data is not available in @/data/countries, we will use a local list or fetch it.
// Checking AlibabaHeader.tsx, it imports from "@/data/countries".

interface LocationFilterProps {
    selectedLocations: string[];
    onChange: (locations: string[]) => void;
}

export function LocationFilter({ selectedLocations, onChange }: LocationFilterProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLocationChange = (code: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedLocations, code]);
        } else {
            onChange(selectedLocations.filter((c) => c !== code));
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Supplier Location</h3>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs"
                />
            </div>

            <ScrollArea className="h-[180px] w-full pr-3">
                <div className="space-y-2">
                    {filteredCountries.slice(0, 20).map((country) => (
                        <div key={country.code} className="flex items-center space-x-2">
                            <Checkbox
                                id={`loc-${country.code}`}
                                checked={selectedLocations.includes(country.code)}
                                onCheckedChange={(checked) => handleLocationChange(country.code, checked as boolean)}
                            />
                            <Label
                                htmlFor={`loc-${country.code}`}
                                className="flex items-center text-sm font-normal cursor-pointer w-full"
                            >
                                <img
                                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                    alt={country.name}
                                    className="w-4 h-3 mr-2 object-cover rounded-[1px]"
                                />
                                <span className="truncate">{country.name}</span>
                            </Label>
                        </div>
                    ))}

                    {filteredCountries.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                            No countries found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
