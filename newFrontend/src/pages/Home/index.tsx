import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  User,
  Sun,
  Moon,
  Globe,
  Music,
  Car,
  Calendar,
  Settings,
  Coffee,
  ChevronLeft,
  Mic,
  MicOff,
} from 'lucide-react';
import OpenOnceConversation from '@/components/OpenOnceConversation';
import { handleStreamSpeech } from '@/utils/speechUtils';

import AssistantChat from '../../components/AssistantChat';
import CarModel from '@/components/CarModel';
import NavBar from '@/components/NavBar';

export default function CarSystemHomepage() {
  const [conversation, setConversation] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('中文');
  const [voice, setVoice] = useState('默认');
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      if (conversation.length < 5) {
        setConversation((prev) => [...prev, '系统：有什么可以帮助您的吗？']);
      } else {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [conversation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleInputChange', e.target.value);
    setInputText(e.target.value);
  };
  console.log('inputText', inputText);
  const handleSubmit = async (e: React.FormEvent & { currentText?: string }) => {
    e.preventDefault();
    const currentText = (e as any).currentText || inputText.trim();
    console.log('currentText', currentText);

    if (currentText) {
      setConversation((prev) => [...prev, `用户：${currentText}`]);

      await handleStreamSpeech(currentText, () => {
        console.log('语音合成完成');
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === '中文' ? 'English' : '中文');
  };

  const toggleVoice = () => {
    setVoice(voice === '默认' ? '女声' : voice === '女声' ? '男声' : '默认');
  };

  const toggleListeningMode = () => {
    setIsListeningMode(!isListeningMode);
  };

  return (
    <div className={`min-h-screen bg-[#f2f2f2] text-[#000000] p-8 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 0.8,
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className="text-3xl font-bold relative group inline-block"
          style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}>
          <span className="bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] text-transparent bg-clip-text">
            车载系统-AutoPoss
          </span>
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </motion.h1>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleListeningMode}
            className={`bg-[#d5001c] text-white p-2 rounded-full ${
              isListeningMode ? 'bg-opacity-100' : 'bg-opacity-50'
            }`}>
            {isListeningMode ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            {theme === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            <Globe className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVoice}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            <Music className="w-6 h-6" />
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-full p-2 shadow-lg">
            <User className="w-6 h-6 text-[#d5001c]" />
          </motion.div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex gap-8 flex-grow">
        {/* 左侧应用按钮 */}
        <NavBar isNavExpanded={isNavExpanded} setIsNavExpanded={setIsNavExpanded} />

        {/* 中央车辆信息 */}
        <CarModel />

        {/* 右侧智能助手 */}
        <AssistantChat
          conversation={conversation}
          inputText={inputText}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
      {isListeningMode && <OpenOnceConversation />}
    </div>
  );
}
