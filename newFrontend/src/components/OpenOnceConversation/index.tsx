import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '../Toast';
import CommandListener from '../CommandListener';
import styles from './index.module.less';
import { handleStreamSpeech, checkVoiceCommand, playAudio } from '@/utils/speechUtils';

interface Props {
  onShortCommand?: (text: string) => void;
}

export interface StreamSpeechRequest {
  prompt: string;
  audioSource?: string;
  VoiceName?: string;
}

const OpenOnceConversation: React.FC<Props> = ({ onShortCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [showCommandListener, setShowCommandListener] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const initializeWakeWordRecognition = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      Toast.show({
        type: 'warning',
        message: '浏览器不支持语音识别',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // @ts-ignore
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;

        if (
          event.results[current].isFinal &&
          (transcriptResult.includes('小保') || transcriptResult.includes('小宝') || transcriptResult.includes('小豹'))
        ) {
          recognition.stop();
          console.log('识别到唤醒词:', transcriptResult);

          playAudio('/hi_xiaobao.wav')
            .then(() => {
              setShowCommandListener(true);
            })
            .catch((error) => {
              console.error('音频播放失败:', error);
              setShowCommandListener(true);
            });

          setTimeout(() => {
            setShowCommandListener(true);
          }, 2100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('麦克风初始化失败:', error);
      Toast.show({
        type: 'error',
        message: '麦克风初始化失败',
      });
    }
  };

  useEffect(() => {
    initializeWakeWordRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const handleCommandComplete = (command: string) => {
    if (!command) return;
    console.log('收到指令:', command);
    onShortCommand?.(command);

    // 停止语音识别
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // 检查语音命令
    checkVoiceCommand(command)
      .then((result) => {
        if (result.success) {
          console.log('语音命令检查响应:', result.data);
        } else {
          console.error('语音命令检查失败:', result.message);
        }
      })
      .catch((error) => {
        console.error('命令检查失败:', error);
      });

    // 处理语音合成
    handleStreamSpeech(command, () => {
      if (showCommandListener) {
        setShowCommandListener(false);
      }
      initializeWakeWordRecognition();
    }).catch((error) => {
      console.error('语音合成失败:', error);
    });
  };

  return (
    <AnimatePresence>
      {showCommandListener && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4">
          <CommandListener
            onClose={() => {
              setShowCommandListener(false);
              initializeWakeWordRecognition();
            }}
            onCommandComplete={handleCommandComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OpenOnceConversation;
