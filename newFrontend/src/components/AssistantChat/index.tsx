import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Send, Mic } from 'lucide-react';
import { SubmitType } from '@/types/chat';

interface AssistantChatProps {
  conversation: string[];
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent & { currentText?: string }, type: SubmitType) => void;
  isChatExpanded: boolean;
  setIsChatExpanded: (value: boolean) => void;
}

export default function AssistantChat({
  conversation,
  inputText,
  onInputChange,
  onSubmit,
  isChatExpanded,
  setIsChatExpanded,
}: AssistantChatProps) {
  const handleSubmitWrapper = (e: React.FormEvent) => {
    const submitType = inputText.trim() ? SubmitType.TEXT : SubmitType.AUDIO;
    onSubmit(e, submitType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: 1,
        x: 0,
        width: isChatExpanded ? '25%' : '80px',
      }}
      transition={{ duration: 0.3 }}
      className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatExpanded(!isChatExpanded)}
        className={`${isChatExpanded ? 'self-start' : 'self-center'} mb-2`}>
        <ChevronRight className={`w-6 h-6 transform transition-transform ${isChatExpanded ? '' : 'rotate-180'}`} />
      </motion.button>

      {isChatExpanded && (
        <>
          <div className="flex-grow overflow-y-auto mb-4 space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.startsWith('用户') ? 'bg-[#d5001c] text-white ml-8' : 'bg-gray-100 mr-8'
                }`}>
                {message}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitWrapper} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={onInputChange}
              placeholder="请输入您的问题..."
              className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d5001c]"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-[#d5001c] text-white p-3 rounded-lg">
              {inputText.trim() ? <Send className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>
          </form>
        </>
      )}
    </motion.div>
  );
}
