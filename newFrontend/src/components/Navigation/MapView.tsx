import React from "react";
import { motion } from "framer-motion";

export default function MapView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-white bg-opacity-70 rounded-xl p-4 relative overflow-hidden"
    >
      <img
        src="/map-placeholder.jpg"
        alt="地图"
        className="w-full h-full object-cover rounded-lg"
      />
      {/* 这里可以添加地图控件、标记点等 */}
    </motion.div>
  );
}
