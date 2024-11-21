import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Toast } from '../Toast';
import CommandListener from '../CommandListener';
import styles from './index.module.less';

interface Props {
  onShortCommand?: (text: string) => void;
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

  const handleCommandComplete = (command: string) => {
    console.log('收到指令:', command);
    onShortCommand?.(command);
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
