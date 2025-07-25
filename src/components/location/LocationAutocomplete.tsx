
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocationAutocomplete } from '@/hooks/useLocationAutocomplete';
import { useAuth } from '@/contexts/AuthContext';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
  allowUnauthenticated?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter city or location",
  disabled = false,
  required = false,
  label = "Location",
  className = "",
  allowUnauthenticated = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { suggestions, isLoading, error, noResults, searchLocations, clearSuggestions } = useLocationAutocomplete();

  if (!user && !allowUnauthenticated) {
    return null;
  }

  // Enhanced search with optimized debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (inputValue.trim() && inputValue.length >= 2) {
        console.log('🔍 Enhanced search triggered for:', inputValue);
        searchLocations(inputValue.trim());
        setShowManualEntry(false);
      } else if (!inputValue.trim()) {
        clearSuggestions();
        setIsOpen(false);
        setShowManualEntry(false);
      }
    }, 800); // Optimized debounce for better UX with API calls

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [inputValue, searchLocations, clearSuggestions]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Enhanced dropdown visibility logic
  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      if (suggestions.length > 0) {
        console.log('📋 Showing enhanced suggestions:', suggestions.length);
        setIsOpen(true);
        setShowManualEntry(false);
      } else if (noResults && !isLoading && !error) {
        console.log('📭 Enhanced search: No results, showing manual entry option');
        setIsOpen(true);
        setShowManualEntry(true);
      } else if (error) {
        console.log('❌ Enhanced search: Error occurred, showing manual entry option');
        setIsOpen(true);
        setShowManualEntry(true);
      }
    }
  }, [suggestions, noResults, isLoading, error, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        console.log('🔒 Enhanced search: Closing dropdown - clicked outside');
        setIsOpen(false);
        setShowManualEntry(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('✏️ Enhanced search: Input changed:', newValue);
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      onChange('');
      clearSuggestions();
      setIsOpen(false);
      setShowManualEntry(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    console.log('✅ Enhanced search: Selected suggestion:', suggestion.displayName);
    setInputValue(suggestion.displayName);
    onChange(suggestion.displayName);
    setIsOpen(false);
    setShowManualEntry(false);
    clearSuggestions();
  };

  const handleManualEntry = () => {
    console.log('✍️ Enhanced search: Using manual entry for:', inputValue);
    onChange(inputValue);
    setIsOpen(false);
    setShowManualEntry(false);
    clearSuggestions();
  };

  const handleInputFocus = () => {
    console.log('🔍 Enhanced search: Input focused, current suggestions:', suggestions.length);
    if (inputValue.trim().length >= 2) {
      if (suggestions.length > 0) {
        setIsOpen(true);
      } else if (noResults || error) {
        setIsOpen(true);
        setShowManualEntry(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('⛔ Enhanced search: Escape pressed, closing dropdown');
      setIsOpen(false);
      setShowManualEntry(false);
    } else if (e.key === 'Enter' && showManualEntry) {
      e.preventDefault();
      handleManualEntry();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="location" className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          ref={inputRef}
          id="location"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        )}
        
        {/* Enhanced Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.length > 0 && (
              <>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionSelect(suggestion);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-800 truncate">{suggestion.displayName}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
            
            {/* Enhanced Manual Entry Option */}
            {showManualEntry && inputValue.trim().length >= 2 && (
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start gap-3 mb-3">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {error ? (
                      <>
                        <p className="text-sm text-red-600 mb-2">
                          {error}
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          You can still enter your location manually
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 mb-2">
                          No cities found matching "{inputValue}"
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          Try different spelling or use "City, State" format
                        </p>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleManualEntry}
                      className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded transition-colors"
                    >
                      Use "{inputValue}" as entered
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAutocomplete;
