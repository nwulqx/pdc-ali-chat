import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isNavExpanded: boolean;
}

export default function NavButton({ icon, label, isNavExpanded }: NavButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-4 shadow-lg flex items-center ${
        isNavExpanded ? 'justify-start' : 'justify-center'
      } overflow-hidden`}>
      <div className={`text-[#d5001c] ${isNavExpanded ? 'min-w-[32px]' : ''}`}>{icon}</div>
      <motion.span
        className="text-sm font-medium whitespace-nowrap"
        animate={{
          opacity: isNavExpanded ? 1 : 0,
          width: isNavExpanded ? 'auto' : 0,
          marginLeft: isNavExpanded ? '1rem' : 0,
        }}
        transition={{ duration: 0.2 }}>
        {label}
      </motion.span>
    </motion.button>
  );
}
