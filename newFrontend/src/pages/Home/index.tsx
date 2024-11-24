import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
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
} from "lucide-react";
import OpenOnceConversation from "@/components/OpenOnceConversation";
import { handleStreamSpeech } from "@/utils/speechUtils";
import CarModel from "@/components/CarModel";
import NavBar from "@/components/NavBar";

import AssistantChat from "../../components/AssistantChat";
import { SubmitType } from "@/types/chat";
import Schedule from "@/components/Schedule";
import SettingModel from "@/components/Settings";
import RestReminder from "@/components/RestReminder";
import Navigation from "@/components/Navigation";

export default function CarSystemHomepage() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("中文");
  const [voice, setVoice] = useState("默认");
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [currentModule, setCurrentModule] = useState("车辆信息");

  const handleResetListeningMode = () => {
    setIsListeningMode(false);
    setTimeout(() => {
      setIsListeningMode(true);
    }, 100);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    setLanguage(language === "中文" ? "English" : "中文");
  };

  const toggleVoice = () => {
    setVoice(voice === "默认" ? "女声" : voice === "女声" ? "男声" : "默认");
  };

  const toggleListeningMode = () => {
    setIsListeningMode(!isListeningMode);
  };

  return (
    <div
      className={`min-h-screen bg-[#f2f2f2] text-[#000000] p-8 flex flex-col ${
        theme === "dark" ? "dark" : ""
      }`}
    >
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
              ease: "easeInOut",
            },
          }}
          className="text-3xl font-bold relative group inline-block"
          style={{
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
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
              isListeningMode ? "bg-opacity-100" : "bg-opacity-50"
            }`}
          >
            {isListeningMode ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="bg-[#d5001c] text-white p-2 rounded-full"
          >
            {theme === "light" ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            className="bg-[#d5001c] text-white p-2 rounded-full"
          >
            <Globe className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVoice}
            className="bg-[#d5001c] text-white p-2 rounded-full"
          >
            <Music className="w-6 h-6" />
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-full p-2 shadow-lg"
          >
            <User className="w-6 h-6 text-[#d5001c]" />
          </motion.div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex gap-8 flex-grow">
        {/* 左侧应用按钮 */}
        <NavBar
          isNavExpanded={isNavExpanded}
          setIsNavExpanded={setIsNavExpanded}
          currentModule={currentModule}
          onModuleChange={setCurrentModule}
        />

        {/* 中央车辆信息 */}
        {currentModule === "日程" ? (
          <Schedule />
        ) : currentModule === "车辆信息" ? (
          <CarModel />
        ) : currentModule === "设置" ? (
          <SettingModel />
        ) : currentModule === "休息提醒" ? (
          <RestReminder />
        ) : currentModule === "导航" ? (
          <Navigation />
        ) : null}

        {/* 右侧智能助手 */}
        <AssistantChat />
      </div>
      {isListeningMode && (
        <OpenOnceConversation
          handleResetListeningMode={handleResetListeningMode}
        />
      )}
    </div>
  );
}
