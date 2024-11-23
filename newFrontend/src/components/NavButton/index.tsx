import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isNavExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
}

export default function NavButton({ icon, label, isNavExpanded, isActive, onClick }: NavButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
        isNavExpanded ? 'w-full justify-start' : 'w-[72px] justify-center'
      } ${isActive ? 'bg-[#d5001c] text-white' : 'hover:bg-white/30'}`}>
      {icon}
      {isNavExpanded && <span className={isActive ? 'text-white' : 'text-gray-700'}>{label}</span>}
    </motion.button>
  );
}
