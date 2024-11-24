import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
  Minimize2,
  Maximize2,
} from "lucide-react";

const mockSongs = [
  {
    id: 1,
    title: "降B大调《春之声圆舞曲》",
    artist: "Frühlingsstimmen, Walzer, Op. 410",
    cover: "/cover.jpg",
  },
  { id: 2, title: "海阔天空", artist: "Beyond", cover: "/cover.jpg" },
  { id: 3, title: "晴天", artist: "周杰伦", cover: "/cover.jpg" },
];

interface MusicPlayerProps {
  isVisible: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

export default function MusicPlayer({
  isVisible,
  onClose,
  buttonRef,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = mockSongs[currentSongIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevSong = () => {
    setCurrentSongIndex((prev) =>
      prev === 0 ? mockSongs.length - 1 : prev - 1
    );
  };

  const handleNextSong = () => {
    setCurrentSongIndex((prev) =>
      prev === mockSongs.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed top-5 left-[400px] z-50"
        >
          <motion.div
            layout
            transition={{ duration: 0.3 }}
            className={`bg-white/90 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg ${
              isMinimized ? "p-2" : "p-4"
            }`}
          >
            {isMinimized ? (
              <div className="flex items-center gap-3 w-[200px]">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full overflow-hidden"
                >
                  <img
                    src={currentSong.cover}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <span className="text-sm font-medium truncate flex-1">
                  {currentSong.title}
                </span>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-[#d5001c]" />
                    ) : (
                      <Play className="w-5 h-5 text-[#d5001c]" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMinimized(false)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="w-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Music2 className="w-5 h-5 text-[#d5001c]" />
                    <span className="font-medium">正在播放</span>
                  </div>
                  <button onClick={() => setIsMinimized(true)}>
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>

                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg"
                >
                  <img
                    src={currentSong.cover}
                    alt="album cover"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium mb-1">
                    {currentSong.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{currentSong.artist}</p>
                </div>

                <div className="flex justify-center items-center gap-6 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevSong}
                    className="text-gray-600"
                  >
                    <SkipBack className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="bg-[#d5001c] text-white p-3 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextSong}
                    className="text-gray-600"
                  >
                    <SkipForward className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
            <audio ref={audioRef} src="/music1.mp3" loop />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
