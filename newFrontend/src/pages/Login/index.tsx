import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

import './index.css';
import { useNavigate } from 'react-router-dom';

// 添加 Loading 组件
const LoadingSpinner = () => (
  <div className="inline-block">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 添加加载状态

  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在这里处理登录逻辑
    console.log('登录提交', { email, password });
    setLoading(true);
    setTimeout(() => {
      if (email === 'autoposs@admin.com' && password === '123456') {
        setLoading(false);
        navigate('/home');
      } else {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center text-[#000000] mb-6">
              欢迎回来
            </motion.h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <label htmlFor="email" className="block text-sm font-medium text-[#000000]">
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-80 border border-[#e6e6e6] rounded-md text-[#000000] placeholder-[#96989a] focus:outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent transition duration-200"
                  placeholder="请输入您的邮箱"
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-[#000000]">
                  密码
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-80 border border-[#e6e6e6] rounded-md text-[#000000] placeholder-[#96989a] focus:outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent transition duration-200"
                  placeholder="请输入您的密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#626669]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#626669]" />
                  )}
                </button>
              </motion.div>
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#d5001c] hover:bg-[#e5001e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d5001c] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">登录中...</span>
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </motion.div>
            </form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center">
              <a href="#" className="text-sm text-[#0061bd] hover:text-[#0080fa] transition duration-200">
                忘记密码？
              </a>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center">
          <p className="text-sm text-[#626669]">
            还没有账号？{' '}
            <a href="#" className="font-medium text-[#0061bd] hover:text-[#0080fa] transition duration-200">
              立即注册
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
