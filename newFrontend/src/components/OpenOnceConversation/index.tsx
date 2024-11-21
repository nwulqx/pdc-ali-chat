import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Toast } from '../Toast';
import styles from './index.module.less';

interface Props {
  onShortCommand?: (text: string) => void;
}

const OpenOnceConversation: React.FC<Props> = ({ onShortCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isActiveMode, setIsActiveMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [record, setRecord] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    setLoaded(true);
  };

  const createWaveSurfer = () => {
    if (!waveformRef.current) return;

    if (wavesurfer) {
      wavesurfer.destroy();
    }

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#1890ff',
      progressColor: '#1890ff',
      height: 40,
      width: 200,
    });

    const rec = ws.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      })
    );

    setWavesurfer(ws);
    setRecord(rec);
  };
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsActiveMode(false);
      setTranscript('');
    }, 5000);
  };
  const startActiveMode = () => {
    setIsActiveMode(true);
    resetTimer();
    Toast.show({
      type: 'success',
      message: '已进入对话模式',
    });
  };
  const initializeSpeechRecognition = async () => {
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
        console.log('语音识别开始');
      };

      recognition.onend = () => {
        console.log('语音识别结束');
        if (isListening) {
          recognition.start();
        }
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        console.log('识别结果:', transcriptResult);

        if (
          transcriptResult.includes('小保') ||
          transcriptResult.includes('小宝') ||
          transcriptResult.includes('小豹')
        ) {
          startActiveMode();
        }

        if (isActiveMode) {
          setTranscript(transcriptResult);
          resetTimer();
          onShortCommand?.(transcriptResult);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        Toast.show({
          type: 'error',
          message: '语音识别出错',
        });
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

  const releaseResources = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (wavesurfer) {
      wavesurfer.destroy();
      setWavesurfer(null);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    loadFFmpeg();
    initializeSpeechRecognition();

    return () => {
      releaseResources();
    };
  }, []);

  useEffect(() => {
    if (isActiveMode) {
      setTimeout(() => {
        createWaveSurfer();
      }, 0);
    }
  }, [isActiveMode]);

  const handleClose = () => {
    setIsActiveMode(false);
    setTranscript('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <>
      <AnimatePresence>
        {isActiveMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Mic className="w-5 h-5 text-[#d5001c]" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d5001c] rounded-full animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">正在听您说...</span>
                  </div>
                  <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div ref={waveformRef} className="mb-2" style={{ minHeight: '40px' }} />
                <div className="min-h-[40px] p-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">{transcript || '等待您的指令...'}</p>
                </div>
                <div className="mt-2">
                  <motion.div
                    className="h-1 bg-[#d5001c] rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default OpenOnceConversation;
