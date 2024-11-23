import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Car, Calendar, Settings, Coffee, ChevronLeft } from 'lucide-react';
import NavButton from '../NavButton';

interface NavBarProps {
  isNavExpanded: boolean;
  setIsNavExpanded: (value: boolean) => void;
}

export default function NavBar({ isNavExpanded, setIsNavExpanded }: NavBarProps) {
  const navItems = [
    { icon: <Navigation className="w-8 h-8" />, label: '导航' },
    { icon: <Car className="w-8 h-8" />, label: '车辆信息' },
    { icon: <Calendar className="w-8 h-8" />, label: '日程' },
    { icon: <Settings className="w-8 h-8" />, label: '设置' },
    { icon: <Coffee className="w-8 h-8" />, label: '休息提醒' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{
        opacity: 1,
        x: 0,
        width: isNavExpanded ? '25%' : '80px',
      }}
      transition={{ duration: 0.3 }}
      className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsNavExpanded(!isNavExpanded)}
        className={`${isNavExpanded ? 'self-end' : 'self-center'} mb-2`}>
        <ChevronLeft className={`w-6 h-6 transform transition-transform ${isNavExpanded ? '' : 'rotate-180'}`} />
      </motion.button>

      {navItems.map((item, index) => (
        <NavButton key={index} icon={item.icon} label={item.label} isNavExpanded={isNavExpanded} />
      ))}
    </motion.div>
  );
}
