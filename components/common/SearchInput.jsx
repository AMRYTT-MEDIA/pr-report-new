"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchInput = ({ value, onChange, onClear, placeholder = "Search...", className = "" }) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      // If onClear is not provided, call onChange with empty value
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={`relative ${className || "sm:max-w-[400px] lg:w-full"}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-9 pr-8 py-2.5 rounded-[41px] border-slate-200 text-slate-600 placeholder:text-slate-600 font-semibold focus:border-indigo-500 placeholder:opacity-50"
      />
      {value && (
        <button type="button" onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2">
          <X className="h-6 w-6 text-muted-foreground bg-slate-200 rounded-xl p-1" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
