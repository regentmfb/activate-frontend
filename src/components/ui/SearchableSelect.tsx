'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@src/utils';

export type SearchableSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-3.5 rounded-xl text-[14px] font-medium flex items-center justify-between cursor-pointer border transition-all",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" : "bg-white hover:bg-gray-50 border-gray-200",
          isOpen ? "bg-white border-[#920793] ring-4 ring-[#920793]/10" : "",
          !value ? "text-gray-400" : "text-gray-900",
          className
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-gray-50 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
            <input
              autoFocus
              type="text"
              className="w-full h-8 text-[13px] bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-[13px] text-gray-500">No results found.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-[13px] font-medium rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                    value === opt ? "bg-purple-50 text-[#920793]" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="h-4 w-4 text-[#920793]" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
