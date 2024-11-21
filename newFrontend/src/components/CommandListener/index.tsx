import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { Toast } from '../Toast';

interface Props {
  onClose: () => void;
  onCommandComplete: (command: string) => void;
}

const CommandListener: React.FC<Props> = ({ onClose, onCommandComplete }) => {
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef(''); // 添加 ref 追踪最新的 transcript
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const createWaveSurfer = () => {
    if (!waveformRef.current) return;

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
  };

  const initializeCommandRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // @ts-ignore
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        transcriptRef.current = transcriptResult; // 更新 ref
      };

      recognition.onend = () => {
        console.log('指令识别结束');
      };

      recognition.onerror = (event: any) => {
        console.error('指令识别错误:', event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();

      // 使用 ref 获取最新的 transcript
      timeoutRef.current = setTimeout(() => {
        const finalTranscript = transcriptRef.current;
        if (finalTranscript.trim()) {
          onCommandComplete(finalTranscript);
        }
        handleClose();
      }, 5000);
    } catch (error) {
      console.error('麦克风初始化失败:', error);
    }
  };

  useEffect(() => {
    createWaveSurfer();
    initializeCommandRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (wavesurfer) {
        wavesurfer.destroy();
      }
    };
  }, []);

  const handleClose = () => {
    const finalTranscript = transcriptRef.current;
    if (finalTranscript.trim()) {
      onCommandComplete(finalTranscript);
    }
    onClose();
  };

  return (
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
  );
};

export default CommandListener;
