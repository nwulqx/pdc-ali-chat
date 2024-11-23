import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import VoiceWaveform from '../VoiceWaveform';

interface AssistantChatProps {
  conversation: string[];
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ conversation, inputText, onInputChange, onSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const handleTranscript = (text: string) => {
    if (!text.trim()) {
      return;
    }
    // 更新输入框显示
    const changeEvent = {
      target: { value: text },
    } as React.ChangeEvent<HTMLInputElement>;
    console.log('handleTranscript', changeEvent);
    onInputChange(changeEvent);

    // 创建自定义事件对象，确保包含文本内容
    const submitEvent = {
      preventDefault: () => {},
      currentText: text,
    } as React.FormEvent & { currentText: string };

    console.log('发送文本:', text); // 调试日志
    onSubmit(submitEvent);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-1/4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col">
      <AnimatePresence>
        {isListening ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center">
            <button
              onClick={() => setIsListening(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <motion.div
              className="relative mb-8"
              animate={{
                scale: 1 + (audioLevel / 255) * 0.3,
              }}
              transition={{ duration: 0.1 }}>
              <div className="w-24 h-24 bg-[#d5001c] rounded-full flex items-center justify-center">
                <Mic className="w-12 h-12 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#d5001c]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
            <div className="w-full max-w-[300px] mb-4">
              <VoiceWaveform
                isRecording={isListening}
                onAudioLevel={(level) => setAudioLevel(level)}
                onTranscript={handleTranscript}
              />
            </div>

            <p className="mt-2 text-lg font-medium text-gray-700">正在聆听...</p>

            <div className="mt-4 w-full max-w-[300px] h-[60px] overflow-y-auto bg-gray-50 rounded-lg p-2">
              <p className="text-sm text-gray-600">{inputText || '等待说话...'}</p>
            </div>
          </motion.div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-[#000000]">智能助手</h2>
            <div className="flex-grow overflow-y-auto mb-4 space-y-2">
              {conversation.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.startsWith('用户') ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-2 rounded-lg ${
                    message.startsWith('用户') ? 'bg-[#d5001c] text-white ml-auto' : 'bg-[#e6e6e6] text-[#000000]'
                  } inline-block max-w-3/4`}>
                  {message}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="flex items-center mt-auto">
        <input
          type="text"
          value={inputText}
          onChange={onInputChange}
          className="flex-grow bg-white border border-[#e6e6e6] rounded-l-full py-2 px-4 outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent"
          placeholder={isListening ? '正在聆听...' : '输入您的问题...'}
        />
        <button
          type="button"
          onClick={() => setIsListening(!isListening)}
          className={`bg-[#d5001c] text-white rounded-r-full p-2 ${isListening ? 'animate-pulse' : ''}`}>
          <Mic className="w-6 h-6" />
        </button>
      </form>
    </motion.div>
  );
};

export default AssistantChat;
