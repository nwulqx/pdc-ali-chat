import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  Navigation as NavIcon,
  Bot,
} from "lucide-react";
import MapView from "./MapView";

interface WeeklyRoute {
  id: string;
  day: string;
  place: string;
  time: string;
  type: "history" | "recommend" | "frequent";
  aiRecommended?: boolean;
}

export default function Navigation() {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weeklyRoutes, setWeeklyRoutes] = useState<WeeklyRoute[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 模拟获取周常路线
  const fetchWeeklyRoutes = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockWeeklyData = [
      {
        id: "1",
        day: "周一",
        place: "公司",
        time: "预计30分钟",
        type: "frequent",
        aiRecommended: true,
      },
      {
        id: "2",
        day: "周二",
        place: "健身房",
        time: "预计20分钟",
        type: "recommend",
      },
      {
        id: "3",
        day: "周三",
        place: "图书馆",
        time: "预计25分钟",
        type: "recommend",
        aiRecommended: true,
      },
      {
        id: "4",
        day: "周四",
        place: "咖啡厅",
        time: "预计15分钟",
        type: "history",
      },
      {
        id: "5",
        day: "周五",
        place: "商场",
        time: "预计40分钟",
        type: "recommend",
        aiRecommended: true,
      },
      {
        id: "6",
        day: "周六",
        place: "公园",
        time: "预计35分钟",
        type: "frequent",
      },
      {
        id: "7",
        day: "周日",
        place: "电影院",
        time: "预计25分钟",
        type: "recommend",
      },
    ];

    setWeeklyRoutes(mockWeeklyData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWeeklyRoutes();
  }, []);

  return (
    <div className="flex-1 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl overflow-hidden relative h-[calc(100vh-8rem)]">
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 w-[400px] z-10"
        ref={searchRef}
      >
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="搜索目的地..."
            className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#d5001c] transition-all"
          />
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute right-3 top-3.5 w-5 h-5 border-2 border-[#d5001c] border-t-transparent rounded-full"
            />
          )}
        </div>

        {/* 下拉推荐 */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full mt-2 bg-white/90 rounded-xl shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
            >
              {weeklyRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  className="p-4 border-b border-gray-100 last:border-0 cursor-pointer"
                  onClick={() => {
                    setSearchValue(route.place);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 min-w-[40px]">
                        {route.day}
                      </div>
                      <MapPin className="w-4 h-4 text-[#d5001c]" />
                      <span>{route.place}</span>
                      {route.aiRecommended && (
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          <Bot className="w-3 h-3" />
                          <span>AI推荐</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{route.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 地图区域 */}
      <div className="w-full h-full">
        <MapView />
      </div>
    </div>
  );
}
