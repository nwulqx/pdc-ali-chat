import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '../Toast';
import CommandListener from '../CommandListener';
import styles from './index.module.less';
import { handleStreamSpeech } from '@/utils/speechUtils';

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
        console.log('transcriptResult', transcriptResult);
        if (
          transcriptResult.includes('小保') ||
          transcriptResult.includes('小宝') ||
          transcriptResult.includes('小豹')
        ) {
          recognition.stop();
          setShowCommandListener(true);
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

  const handleCommandComplete = async (command: string) => {
    console.log('收到指令:', command);
    onShortCommand?.(command);

    // 停止语音识别
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // 发送 checkMessage 请求
    fetch('http://127.0.0.1:8080/checkMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: command,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('checkMessage 响应:', result);
      })
      .catch((error) => {
        console.error('checkMessage 请求失败:', error);
      });
    await handleStreamSpeech(command, () => {
      // 完成后的回调
      if (showCommandListener) {
        setShowCommandListener(false);
      }
      initializeWakeWordRecognition();
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
