import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Car, Calendar, Settings, Coffee, ChevronLeft } from 'lucide-react';
import NavButton from '../NavButton';

interface NavBarProps {
  isNavExpanded: boolean;
  setIsNavExpanded: (value: boolean) => void;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

export default function NavBar({ isNavExpanded, setIsNavExpanded, currentModule, onModuleChange }: NavBarProps) {
  const navItems = [
    { icon: <Navigation className="w-8 h-8" />, label: '导航', component: null },
    { icon: <Car className="w-8 h-8" />, label: '车辆信息', component: 'CarModel' },
    { icon: <Calendar className="w-8 h-8" />, label: '日程', component: null },
    { icon: <Settings className="w-8 h-8" />, label: '设置', component: null },
    { icon: <Coffee className="w-8 h-8" />, label: '休息提醒', component: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{
        opacity: 1,
        x: 0,
        width: isNavExpanded ? '25%' : '100px',
      }}
      transition={{ duration: 0.3 }}
      className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-4 shadow-lg flex flex-col gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsNavExpanded(!isNavExpanded)}
        className={`${isNavExpanded ? 'self-end' : 'self-center'} mb-2`}>
        <ChevronLeft className={`w-6 h-6 transform transition-transform ${isNavExpanded ? '' : 'rotate-180'}`} />
      </motion.button>

      {navItems.map((item, index) => (
        <NavButton
          key={index}
          icon={item.icon}
          label={item.label}
          isNavExpanded={isNavExpanded}
          isActive={currentModule === item.label}
          onClick={() => onModuleChange(item.label)}
        />
      ))}
    </motion.div>
  );
}
