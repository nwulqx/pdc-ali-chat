import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  Clock,
  AlertTriangle,
  Eye,
  Activity,
  Sun,
  Moon,
  ThermometerSun,
  Car,
  Map,
  Brain,
  Heart,
  Droplets,
  Wind,
} from "lucide-react";

interface DrivingStatus {
  drivingTime: number;
  restTime: number;
  fatigueLevel: "normal" | "warning" | "danger";
  lastRestLocation: string;
  nextRestArea: string;
  temperature: number;
  timeOfDay: "day" | "night";
  heartRate: number;
  blinkRate: number;
  humidity: number;
  airQuality: number;
  weatherCondition: "sunny" | "rainy" | "cloudy" | "foggy";
  trafficCondition: "smooth" | "moderate" | "congested";
  personalStats: {
    averageDrivingTime: number;
    preferredRestTime: number;
    fatiguePattern: string[];
  };
}

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-white bg-opacity-50 rounded-lg p-3">
    <div className="text-[#d5001c]">{icon}</div>
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

export default function RestReminder() {
  const [status, setStatus] = useState<DrivingStatus>({
    drivingTime: 120,
    restTime: 0,
    fatigueLevel: "normal",
    lastRestLocation: "上海服务区",
    nextRestArea: "苏州服务区 - 35公里",
    temperature: 23,
    timeOfDay: "day",
    heartRate: 75,
    blinkRate: 15,
    humidity: 55,
    airQuality: 85,
    weatherCondition: "sunny",
    trafficCondition: "smooth",
    personalStats: {
      averageDrivingTime: 150,
      preferredRestTime: 20,
      fatiguePattern: [
        "连续驾驶3小时后疲劳明显",
        "午后1-3点易疲劳",
        "雨天驾驶更易疲劳",
      ],
    },
  });

  // 智能分析驾驶状态
  const analyzeDrivingCondition = () => {
    const conditions = [];

    // 基础状态检查
    if (status.heartRate > 85) {
      conditions.push("心率偏高，请注意放松");
    }
    if (status.blinkRate < 12) {
      conditions.push("眨眼频率降低，可能出现疲劳");
    }
    if (status.temperature > 26) {
      conditions.push("车内温度偏高，建议调节空调");
    }
    if (status.humidity < 40) {
      conditions.push("湿度偏低，建议补充水分");
    }

    // 添加默认的状态分析
    conditions.push(
      `已连续驾驶 ${Math.floor(status.drivingTime / 60)}小时${
        status.drivingTime % 60
      }分钟`
    );
    conditions.push(`下一个休息区：${status.nextRestArea}`);
    conditions.push(
      `当前路况：${
        status.trafficCondition === "smooth"
          ? "通畅"
          : status.trafficCondition === "moderate"
          ? "一般"
          : "拥堵"
      }`
    );

    return conditions;
  };

  // 获取个性化建议
  const getPersonalizedSuggestions = () => {
    const timeOfDay = new Date().getHours();
    const suggestions = [];

    // 时间相关建议
    if (timeOfDay >= 13 && timeOfDay <= 15) {
      suggestions.push("当前是您的易疲劳时段，建议提前休息");
    }

    // 驾驶时长相关建议
    if (status.drivingTime > status.personalStats.averageDrivingTime * 0.8) {
      suggestions.push("即将达到您的平均驾驶时长，建议及时休息");
    }

    // 添加默认建议
    suggestions.push(
      `根据您的驾驶习惯，建议每${Math.floor(
        status.personalStats.preferredRestTime / 60
      )}小时休息${status.personalStats.preferredRestTime % 60}分钟`
    );
    suggestions.push("建议保持良好的精神状态，避免疲劳驾驶");
    suggestions.push(
      `距离上次休息已经${Math.floor(status.restTime / 60)}小时${
        status.restTime % 60
      }分钟`
    );

    // 天气相关建议
    if (status.weatherCondition === "rainy") {
      suggestions.push("雨天行驶请注意减速慢行");
    } else if (status.weatherCondition === "foggy") {
      suggestions.push("雾天行驶请打开雾灯，保持安全距离");
    }

    return suggestions;
  };

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        drivingTime: prev.drivingTime + 1,
        heartRate: prev.heartRate + Math.random() * 2 - 1,
        blinkRate: Math.max(8, prev.blinkRate + Math.random() * 2 - 1),
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <div className="grid grid-cols-3 gap-6">
          {/* 主要状态卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-3 bg-white bg-opacity-70 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <Brain className="w-8 h-8 text-[#d5001c]" />
              <div>
                <h3 className="text-xl font-semibold">智能疲劳分析</h3>
                <p className="text-gray-600">基于多维度数据实时分析</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <StatusCard
                icon={<Heart className="w-5 h-5" />}
                label="心率"
                value={`${Math.round(status.heartRate)} BPM`}
              />
              <StatusCard
                icon={<Eye className="w-5 h-5" />}
                label="眨眼频率"
                value={`${Math.round(status.blinkRate)}/分钟`}
              />
              <StatusCard
                icon={<Droplets className="w-5 h-5" />}
                label="湿度"
                value={`${status.humidity}%`}
              />
              <StatusCard
                icon={<Wind className="w-5 h-5" />}
                label="空气质量"
                value={`${status.airQuality}`}
              />
            </div>
          </motion.div>

          {/* 智能建议面板 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 bg-white bg-opacity-70 rounded-xl p-6 shadow-sm"
          >
            <h4 className="font-semibold mb-4">个性化建议</h4>
            <div className="space-y-3">
              {getPersonalizedSuggestions().map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <Coffee className="w-4 h-4 text-[#d5001c]" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 实时状态分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-70 rounded-xl p-6 shadow-sm"
          >
            <h4 className="font-semibold mb-4">实时状态</h4>
            <div className="space-y-3">
              {analyzeDrivingCondition().map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{condition}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
