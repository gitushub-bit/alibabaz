import { useState, useEffect, useRef } from 'react';
import { Search, Clock, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '@/hooks/useSearchHistory';
// Actually, let's just implement a simple debounce here to avoid dependency issues if use-mobile doesn't have it.
// Or even better, just use useEffect with timeout.

interface SearchAutocompleteProps {
    placeholder?: string;
    onSearch?: (term: string) => void;
    className?: string; // Class for the input element
    containerClassName?: string; // Class for the wrapper
    initialValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function SearchAutocomplete({
    placeholder = "Search products...",
    onSearch,
    className = "",
    containerClassName = "",
    initialValue = "",
    value,
    onChange,
    onKeyDown
}: SearchAutocompleteProps) {
    const navigate = useNavigate();
    const { history, addToHistory, removeFromHistory } = useSearchHistory();
    const [internalQuery, setInternalQuery] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const query = value !== undefined ? value : internalQuery;

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateSearch = (term: string) => {
        if (!term.trim()) return;

        addToHistory(term);
        setIsOpen(false);

        if (onSearch) {
            onSearch(term);
        } else {
            navigate(`/products?q=${encodeURIComponent(term)}`);
        }
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateSearch(query);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }

        if (onKeyDown) onKeyDown(e);
    };

    const popularSearches = ["Wireless Earbuds", "Smart Watch", "Phone Case", "Power Bank", "LED Strip Lights"];

    return (
        <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                    if (onChange) onChange(e.target.value);
                    else setInternalQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
            />

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
                    {query.trim() === '' ? (
                        // Empty state - Show history and popular
                        <div className="p-2">
                            {history.length > 0 && (
                                <div className="mb-2">
                                    <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                        <span>Recent Searches</span>
                                    </div>
                                    <ul>
                                        {history.map((term, idx) => (
                                            <li key={idx} className="group flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                                onClick={() => handleCreateSearch(term)}
                                            >
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                    {term}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromHistory(term);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Popular Searches
                                </div>
                                <div className="flex flex-wrap gap-2 px-3 pb-2">
                                    {popularSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => handleCreateSearch(term)}
                                            className="text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Autocomplete suggestions
                        <div className="py-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                Suggestions
                            </div>
                            <ul>
                                <li
                                    className="flex items-center px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700"
                                    onClick={() => handleCreateSearch(query)}
                                >
                                    <Search className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                    Search for "{query}"
                                </li>
                                {/* Mock suggestions for now, normally would filter or fetch from API */}
                                {popularSearches.filter(s => s.toLowerCase().includes(query.toLowerCase())).map(s => (
                                    <li
                                        key={s}
                                        className="flex items-center px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700"
                                        onClick={() => handleCreateSearch(s)}
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
