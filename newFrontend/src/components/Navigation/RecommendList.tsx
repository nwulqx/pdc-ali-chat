import React from "react";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Recommendation {
  id: string;
  place: string;
  time: string;
  type: "history" | "recommend" | "frequent";
}

interface RecommendListProps {
  recommendations: Recommendation[];
  isLoading: boolean;
}

export default function RecommendList({
  recommendations,
  isLoading,
}: RecommendListProps) {
  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white bg-opacity-50 rounded-xl" />
          ))}
        </div>
      ) : (
        recommendations.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-70 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#d5001c]" />
                <span className="font-medium">{item.place}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{item.time}</span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
