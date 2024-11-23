import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Monitor,
  Shield,
  Bluetooth,
  Wifi,
  Languages,
  Sun,
  Car,
  BatteryCharging,
  Smartphone,
  Radio,
  Navigation,
} from "lucide-react";

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: string | boolean;
  type: "toggle" | "select" | "slider";
  options?: string[];
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export default function Settings() {
  const settingGroups: SettingGroup[] = [
    {
      title: "多媒体设置",
      items: [
        {
          id: "volume",
          icon: <Volume2 className="w-6 h-6" />,
          title: "音量控制",
          description: "调节导航、媒体、通话音量",
          type: "slider",
        },
        {
          id: "display",
          icon: <Monitor className="w-6 h-6" />,
          title: "显示设置",
          description: "亮度、夜间模式、主题",
          type: "select",
          value: "自动",
          options: ["自动", "日间", "夜间"],
        },
      ],
    },
    {
      title: "连接设置",
      items: [
        {
          id: "bluetooth",
          icon: <Bluetooth className="w-6 h-6" />,
          title: "蓝牙连接",
          description: "已连接设备：iPhone 14 Pro",
          type: "toggle",
          value: true,
        },
        {
          id: "wifi",
          icon: <Wifi className="w-6 h-6" />,
          title: "WiFi网络",
          description: "当前网络：Porsche_5G",
          type: "toggle",
          value: true,
        },
        {
          id: "carplay",
          icon: <Smartphone className="w-6 h-6" />,
          title: "CarPlay设置",
          description: "无线连接已启用",
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      title: "车辆设置",
      items: [
        {
          id: "drive_mode",
          icon: <Car className="w-6 h-6" />,
          title: "驾驶模式",
          description: "个性化驾驶模式设置",
          type: "select",
          value: "运动",
          options: ["舒适", "运动", "运动+", "个性化"],
        },
        {
          id: "charging",
          icon: <BatteryCharging className="w-6 h-6" />,
          title: "充电设置",
          description: "智能充电计划",
          type: "toggle",
          value: true,
        },
        {
          id: "radio",
          icon: <Radio className="w-6 h-6" />,
          title: "胎压监测",
          description: "实时胎压显示与警报",
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      title: "导航设置",
      items: [
        {
          id: "nav_voice",
          icon: <Navigation className="w-6 h-6" />,
          title: "导航语音",
          description: "语音提示和音量",
          type: "select",
          value: "智能模式",
          options: ["关闭", "简洁模式", "智能模式"],
        },
      ],
    },
  ];

  return (
    <div className="flex-1 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6">系统设置</h2>

      <div className="grid grid-cols-2 gap-6 overflow-y-auto h-[calc(100vh-12rem)]">
        {settingGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {group.title}
            </h3>
            {group.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white bg-opacity-70 rounded-xl p-4 shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[#d5001c]">{item.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </div>
                  {item.type === "toggle" && (
                    <div
                      className={`w-12 h-6 rounded-full transition-colors ${
                        item.value ? "bg-[#d5001c]" : "bg-gray-300"
                      } relative`}
                    >
                      <div
                        className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform ${
                          item.value ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </div>
                  )}
                  {item.type === "select" && (
                    <select className="bg-transparent border-none outline-none text-[#d5001c]">
                      {item.options?.map((option) => (
                        <option key={option} selected={option === item.value}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
