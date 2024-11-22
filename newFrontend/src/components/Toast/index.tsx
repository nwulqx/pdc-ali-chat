import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ReactDOM from 'react-dom';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose?: () => void;
  duration?: number;
}

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

// 基础 Toast 组件
const ToastComponent: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

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

// Toast 容器组件
const ToastContainer = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  // 暴露给全局的添加方法
  const show = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      message: options.message,
      type: options.type,
      duration: options.duration,
      onClose: () => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    };
    setToasts((prev) => [...prev, toast]);
  };

  // 将 show 方法挂载到全局
  useEffect(() => {
    Toast.show = show;
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// 创建容器元素
const createToastContainer = () => {
  const containerElement = document.createElement('div');
  containerElement.id = 'toast-container';
  document.body.appendChild(containerElement);
  return containerElement;
};

// 初始化 Toast
const initializeToast = () => {
  const container = document.getElementById('toast-container') || createToastContainer();
  ReactDOM.render(<ToastContainer />, container);
};

// Toast 对象 - 同时支持组件形式和静态方法
export const Toast = Object.assign(
  // 组件形式
  ToastComponent,
  // 静态方法
  {
    show: (options: ToastOptions) => {
      // 这个方法会在 ToastContainer 挂载后被重写
      console.warn('Toast not initialized');
    },
    init: initializeToast,
  }
);

// 自动初始化
Toast.init();
