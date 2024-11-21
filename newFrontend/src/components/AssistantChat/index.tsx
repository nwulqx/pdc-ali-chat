import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface AssistantChatProps {
  conversation: string[];
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ conversation, inputText, onInputChange, onSubmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-1/4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col">
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
      <form onSubmit={onSubmit} className="flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={onInputChange}
          className="flex-grow bg-white border border-[#e6e6e6] rounded-l-full py-2 px-4 outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent"
          placeholder="输入您的问题..."
        />
        <button type="submit" className="bg-[#d5001c] text-white rounded-r-full p-2">
          <Mic className="w-6 h-6" />
        </button>
      </form>
    </motion.div>
  );
};

export default AssistantChat;
