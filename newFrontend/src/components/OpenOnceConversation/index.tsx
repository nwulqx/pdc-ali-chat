import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '../Toast';
import CommandListener from '../CommandListener';
import styles from './index.module.less';
import { createParser, type EventSourceMessage } from 'eventsource-parser';

interface Props {
  onShortCommand?: (text: string) => void;
}

interface StreamSpeechRequest {
  prompt: string;
  audioSource: string;
  VoiceName: string;
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

    try {
      const requestData: StreamSpeechRequest = {
        prompt: command,
        audioSource: 'alicloud',
        VoiceName: 'longxiaoxia',
      };

      // 创建音频队列和播放状态
      const audioQueue: string[] = [];
      let isPlaying = false;

      // 定义播放音频的函数
      const playAudio = async (audioContent: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          try {
            const audioData = atob(audioContent);
            const arrayBuffer = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              arrayBuffer[i] = audioData.charCodeAt(i);
            }

            const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };

            audio.onerror = (error) => {
              URL.revokeObjectURL(audioUrl);
              reject(error);
            };

            audio.play();
          } catch (error) {
            reject(error);
          }
        });
      };

      // 处理音频队列的函数
      const processAudioQueue = async () => {
        if (isPlaying || audioQueue.length === 0) return;

        isPlaying = true;
        while (audioQueue.length > 0) {
          const content = audioQueue.shift();
          if (content) {
            try {
              await playAudio(content);
            } catch (error) {
              console.error('音频播放失败:', error);
            }
          }
        }
        isPlaying = false;
      };

      const response = await fetch('http://127.0.0.1:8080/v1/stream-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法创建流读取器');
      }

      // 创建 SSE 解析器
      const parser = createParser({
        onError(err) {
          console.error('SSE 解析错误:', err);
        },
        onEvent(event: EventSourceMessage) {
          try {
            const jsonData = JSON.parse(event.data);
            if (jsonData.success && jsonData.data?.content) {
              // 将音频内容添加到队列
              audioQueue.push(jsonData.data.content);
              // 尝试处理队列
              processAudioQueue();
            }
          } catch (e) {
            console.error('解析音频数据失败:', e);
          }
        },
      });

      // 读取并处理 SSE 数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 流结束时重置解析器
          parser.reset();
          break;
        }

        const chunk = decoder.decode(value);
        parser.feed(chunk);
      }
    } catch (error) {
      console.error('语音合成请求失败:', error);
      Toast.show({
        type: 'error',
        message: '语音合成失败',
      });
    } finally {
      // 音频播放完成后重新初始化语音识别
      if (showCommandListener) {
        setShowCommandListener(false);
      }
      initializeWakeWordRecognition();
    }
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
