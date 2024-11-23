import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Clock } from "lucide-react";
import { ScheduleItem } from "@/types/schedule";

interface ScheduleDetailProps {
  item: ScheduleItem;
  onClose: () => void;
}

export default function ScheduleDetail({ item, onClose }: ScheduleDetailProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl p-6 max-w-lg w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 opacity-10 scale-150">
            {item.icon}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.time}</span>
              </div>
              {item.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="whitespace-pre-line text-gray-700 mb-6">
            {item.description}
          </div>

          {item.type === "activity" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#d5001c] text-white px-6 py-3 rounded-xl w-full font-medium"
            >
              立即报名
            </motion.button>
          )}

          {item.type === "system" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl w-full font-medium"
            >
              立即更新
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
