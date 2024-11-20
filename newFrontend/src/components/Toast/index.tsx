import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-50"
      onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-2">
        {icons[type]}
        <span className="text-gray-700">{message}</span>
      </div>
    </motion.div>
  );
};
