import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

interface VoiceWaveformProps {
  isRecording: boolean;
  onAudioLevel?: (level: number) => void;
  onTranscript?: (text: string) => void;
}

// 添加 ref 接口
export interface VoiceWaveformRef {
  cleanup: () => void;
}

const VoiceWaveform = forwardRef<VoiceWaveformRef, VoiceWaveformProps>(
  ({ isRecording, onAudioLevel, onTranscript }, ref) => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [record, setRecord] = useState<any>(null);
    const waveformRef = useRef<HTMLDivElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>();
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 暴露清理方法给父组件
    useImperativeHandle(ref, () => ({
      cleanup: () => {
        cleanup();
      },
    }));

    const cleanup = () => {
      console.log('Cleaning up resources...');

      // 1. 停止语音识别
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }

      // 2. 取消动画帧
      try {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      } catch (e) {
        console.error('Error canceling animation frame:', e);
      }

      // 3. 停止所有音轨
      try {
        if (streamRef.current) {
          const tracks = streamRef.current.getTracks();
          tracks.forEach((track) => {
            track.stop();
            console.log('Track stopped:', track.kind);
          });
          streamRef.current = null;
        }
      } catch (e) {
        console.error('Error stopping media tracks:', e);
      }

      // 4. 关闭音频上下文
      try {
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
        audioContextRef.current = null;
      } catch (e) {
        console.error('Error closing audio context:', e);
      }

      // 5. 重置分析器
      analyserRef.current = null;
    };

    const setupAudioAnalyser = async (rec: any) => {
      try {
        // 如果已经有流在运行，先清理
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 如果已经有音频上下文，先关闭
        if (audioContextRef.current?.state !== 'closed') {
          await audioContextRef.current?.close();
        }

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        updateAudioLevel();
      } catch (error) {
        console.error('Error setting up audio analyser:', error);
      }
    };

    const startRecording = async () => {
      try {
        await record?.startRecording();
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    const stopRecording = async () => {
      try {
        // 先停止语音识别
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        // 停止录音
        if (record) {
          await record.stopRecording();
        }

        // 确保清理所有资源
        cleanup();
      } catch (error) {
        console.error('Error stopping recording:', error);
        // 即使出错也要尝试清理
        cleanup();
      }
    };

    useEffect(() => {
      if (waveformRef.current) {
        createWaveSurfer();
      }
      return () => {
        wavesurfer?.destroy();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, []);

    useEffect(() => {
      // 只在 isRecording 为 true 时初始化语音识别
      if (isRecording && 'webkitSpeechRecognition' in window) {
        // @ts-ignore
        const SpeechRecognition = window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        // 配置语音识别
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN';

        // 处理识别结果
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);

          for (let i = event.resultIndex; i < results.length; i++) {
            const transcript = results[i][0].transcript;
            const isFinal = results[i].isFinal;

            console.log('识别结果:', { transcript, isFinal });

            if (isFinal) {
              onTranscript?.(transcript);
            }
          }
        };

        // 错误处理
        recognitionRef.current.onerror = (event: any) => {
          console.error('语音识别错误:', event.error);
        };

        // 开始识别
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('启动语音识别失败:', e);
        }
      } else {
        // 当 isRecording 为 false 时，停止语音识别并清理
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current = null; // 重要：清空引用
          } catch (e) {
            console.error('停止语音识别失败:', e);
          }
        }
      }

      // 清理函数
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current = null; // 重要：清空引用
          } catch (e) {
            console.error('清理语音识别失败:', e);
          }
        }
      };
    }, [isRecording]); // 只依赖 isRecording

    const createWaveSurfer = () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }

      const ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: '#d5001c',
        progressColor: '#d5001c',
        height: 80,
        width: 300,
        cursorWidth: 0,
        interact: false,
        hideScrollbar: true,
        normalize: true,
        barWidth: 2,
        barGap: 3,
        barRadius: 3,
      });

      const rec = ws.registerPlugin(
        RecordPlugin.create({
          scrollingWaveform: true,
          renderRecordedAudio: false,
          audioBitsPerSecond: 128000,
          mediaRecorderConfig: {
            audioBitsPerSecond: 128000,
            mimeType: 'audio/webm',
          },
        })
      );

      // 设置音频分析器
      rec.on('record-start', () => {
        setupAudioAnalyser(rec);
      });

      setWavesurfer(ws);
      setRecord(rec);
    };

    const updateAudioLevel = () => {
      if (!analyserRef.current || !isRecording) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // 计算平均音量
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      onAudioLevel?.(average);

      // 继续下一帧
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    useEffect(() => {
      if (isRecording && record) {
        startRecording();
      } else if (!isRecording && record) {
        stopRecording();
      }
    }, [isRecording, record]);

    // 组件卸载时清理
    useEffect(() => {
      return () => {
        cleanup();
      };
    }, []);

    return (
      <div className="flex flex-col items-center w-full">
        <div
          ref={waveformRef}
          className="w-[300px] h-[80px] bg-white/10 rounded-lg"
          style={{
            visibility: isRecording ? 'visible' : 'hidden',
          }}
        />
      </div>
    );
  }
);

export default VoiceWaveform;
