import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Send, Mic } from 'lucide-react';
import { handleStreamSpeech } from '@/utils/speechUtils';
import { SubmitType } from '@/types/chat';
import VoiceWaveform, { VoiceWaveformRef } from '@/components/VoiceWaveform';

export default function AssistantChat() {
  const [conversation, setConversation] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const waveformRef = useRef<VoiceWaveformRef>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (
    e: React.FormEvent & { currentText?: string },
    submitType: SubmitType = SubmitType.TEXT
  ) => {
    e.preventDefault();

    const currentText = (e as any).currentText || inputText.trim();

    if (!currentText && submitType === SubmitType.TEXT) {
      return;
    }

    try {
      if (submitType === SubmitType.TEXT) {
        setConversation((prev) => [...prev, `用户：${currentText}`]);
        setInputText('');
        handleStreamSpeech(currentText);
      } else if (submitType === SubmitType.AUDIO) {
        setConversation((prev) => [...prev, `用户：${currentText}`]);
        await handleStreamSpeech(currentText, () => {
          console.log('音频模式：语音合成完成');
        });
        setInputText('');
      }
    } catch (error) {
      console.error('提交处理出错:', error);
    }
  };

  const handleVoiceButtonClick = () => {
    if (!isResponding) {
      setIsRecording(!isRecording);
    }
  };

  const handleTranscript = async (text: string) => {
    if (text.trim()) {
      setIsResponding(true);
      // 暂停录音
      setIsRecording(false);

      try {
        await handleStreamSpeech(text, () => {
          // 语音回复结束后恢复录音
          setIsResponding(false);
          setIsRecording(true);
        });
        setConversation((prev) => [...prev, `用户：${text}`]);
      } catch (error) {
        console.error('语音处理错误:', error);
        setIsResponding(false);
        setIsRecording(true);
      }
    }
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

      {isChatExpanded ? (
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

          {isRecording && !isResponding && (
            <VoiceWaveform ref={waveformRef} isRecording={isRecording} onTranscript={handleTranscript} />
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="请输入您的问题..."
              className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d5001c]"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={inputText.trim() ? handleSubmit : handleVoiceButtonClick}
              className="bg-[#d5001c] text-white p-3 rounded-lg">
              {inputText.trim() ? (
                <Send className="w-6 h-6" />
              ) : (
                <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
              )}
            </motion.button>
          </form>
        </>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleVoiceButtonClick}
          className="bg-[#d5001c] text-white p-3 rounded-lg self-center mt-auto">
          <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
        </motion.button>
      )}
    </motion.div>
  );
}
