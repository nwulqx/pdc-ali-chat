import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export default function SearchBar({
  value,
  onChange,
  isLoading,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索目的地..."
          className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d5001c] transition-all"
        />
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute right-3 w-5 h-5 border-2 border-[#d5001c] border-t-transparent rounded-full"
          />
        )}
      </div>
    </div>
  );
}
