import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  AlertCircle,
  Zap,
  Users,
  Car,
  Wifi,
  Activity,
  Calendar,
  Wallet,
  Tag,
  BatteryCharging,
  Music,
} from "lucide-react";
import ScheduleDetail from "./ScheduleDetail";
import { ScheduleItem } from "@/types/schedule";

export default function Schedule() {
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  const scheduleItems: ScheduleItem[] = [
    {
      id: "1",
      time: "09:00",
      title: "OTA 系统升级",
      description:
        "新版本 V2.5.0 包含：\n- 智能导航系统优化\n- 语音助手升级\n- 自动泊车系统更新\n- 空调智能控制优化",
      type: "system",
      priority: "high",
      icon: <Wifi className="w-12 h-12 text-blue-500" />,
    },
    {
      id: "2",
      time: "10:30",
      title: '保时捷"绿色出行"车主活动',
      description:
        "诚邀您参加保时捷绿色出行倡议活动：\n- 零碳驾驶体验\n- 新能源技术分享\n- 精美纪念品\n- 车主交流晚宴",
      location: "保时捷体验中心",
      type: "activity",
      priority: "high",
      icon: <Users className="w-12 h-12 text-green-500" />,
    },
    {
      id: "3",
      time: "11:00",
      title: "限时金融方案",
      description:
        "尊享金融优惠：\n- 首付低至20%\n- 24期0利率\n- 置换额外补贴\n- 专属保险礼遇",
      type: "promotion",
      priority: "high",
      icon: <Wallet className="w-12 h-12 text-yellow-500" />,
    },
    {
      id: "4",
      time: "13:30",
      title: "新车型预售活动",
      description:
        "新款Taycan预售特权：\n- 专属限量版配置\n- 早鸟价优惠\n- 终身免费保养\n- VIP专属服务",
      location: "保时捷中心",
      type: "promotion",
      priority: "high",
      icon: <Tag className="w-12 h-12 text-purple-500" />,
    },
    {
      id: "5",
      time: "14:00",
      title: "智能系统自检",
      description:
        "系统将自动检测：\n- 动力系统状态\n- 电池管理系统\n- 制动系统\n- 空调系统",
      type: "maintenance",
      priority: "medium",
      icon: <Activity className="w-12 h-12 text-orange-500" />,
    },
    {
      id: "6",
      time: "15:00",
      title: "充电站导航更新",
      description:
        "新增充电站信息：\n- 实时空位查询\n- 智能路线规划\n- 快充站位置\n- 周边服务设施",
      type: "system",
      priority: "medium",
      icon: <BatteryCharging className="w-12 h-12 text-green-500" />,
    },
    {
      id: "7",
      time: "16:30",
      title: "保时捷山地自驾之旅",
      description:
        "独家定制自驾路线：\n- 专业赛道体验\n- 越野路段探索\n- 风景名胜打卡\n- 精品下午茶",
      location: "云台山景区",
      type: "activity",
      priority: "medium",
      icon: <Car className="w-12 h-12 text-[#d5001c]" />,
    },
    {
      id: "8",
      time: "20:00",
      title: "车主专属音乐会",
      description:
        "保时捷之夜：\n- 古典音乐会\n- 品酒晚宴\n- 车主交流\n- 限量周边",
      location: "音乐厅",
      type: "activity",
      priority: "medium",
      icon: <Music className="w-12 h-12 text-blue-400" />,
    },
  ];

  return (
    <div className="flex-1 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">智能日程</h2>
        <Calendar className="w-6 h-6 text-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scheduleItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
            onClick={() => setSelectedItem(item)}
            className="bg-white bg-opacity-70 rounded-xl p-4 cursor-pointer
                      transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 opacity-10">{item.icon}</div>

            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  item.priority === "high" ? "bg-[#d5001c]" : "bg-orange-500"
                }`}
              />
              <span className="font-semibold">{item.time}</span>
            </div>

            <div className="font-medium text-lg mb-2">{item.title}</div>

            {item.location && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {selectedItem && (
        <ScheduleDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
