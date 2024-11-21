import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Camera, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

import './index.css';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../../components/Toast';

// 添加 Loading 组件
const LoadingSpinner = () => (
  <div className="inline-block">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

// 添加类型定义
interface FaceDetectionState {
  isDetected: boolean;
  progress: number;
  message: string;
  status: 'idle' | 'detecting' | 'success' | 'error';
}

// 添加常量配置
const FACE_CONFIG = {
  DETECTION_INTERVAL: 700, // 检测间隔
  MAX_ATTEMPTS: 60, // 最大尝试次数 (30秒)
  MATCH_THRESHOLD: 0.4, // 人脸匹配阈值
  MIN_DETECTION_CONFIDENCE: 0.7, // 最小检测置信度
} as const;

// 修改类型定义
interface FaceDetectionState {
  isDetected: boolean;
  matchScore: number; // 添加缺失的字段
  progress: number;
  message: string;
  status: 'idle' | 'detecting' | 'success' | 'error';
}

export default function Face() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 添加加载状态
  const [isFaceMode, setIsFaceMode] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [attempts, setAttempts] = useState(0);
  const [successfulFrames, setSuccessfulFrames] = useState(0);
  const [authorizedDescriptor, setAuthorizedDescriptor] = useState<any>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [recognitionTimer, setRecognitionTimer] = useState<NodeJS.Timeout | null>(null);

  // 修改初始状态以匹配接口
  const [detectionState, setDetectionState] = useState<FaceDetectionState>({
    isDetected: false,
    matchScore: 0,
    progress: 0,
    message: '准备开始识别...',
    status: 'idle',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };
  // 优化 updateDetectionState 函数
  const updateDetectionState = useCallback(
    (updates: Partial<FaceDetectionState> | ((prev: FaceDetectionState) => Partial<FaceDetectionState>)) => {
      setDetectionState((prev) => ({
        ...prev,
        ...(typeof updates === 'function' ? updates(prev) : updates),
      }));
    },
    []
  );
  // 修改停止识别函数
  const stopFaceRecognition = useCallback(() => {
    if (recognitionTimer) {
      clearInterval(recognitionTimer);
      setRecognitionTimer(null);
    }
    setIsFaceMode(false);
    // 重置状态
    updateDetectionState({
      isDetected: false,
      matchScore: 0,
      progress: 0,
      message: '准备开始识别...',
      status: 'idle',
    });
    setSuccessfulFrames(0);
    setAttempts(0);
  }, [recognitionTimer, updateDetectionState]);

  const navigate = useNavigate();

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user', // 使用前置摄像头
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在这里处理登录逻辑
    console.log('登录提交', { email, password });
    setLoading(true);
    setTimeout(() => {
      if (email === 'autoposs@admin.com' && password === '123456') {
        setLoading(false);
        navigate('/home');
      } else {
        setLoading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    const loadFaceModels = async () => {
      // 使用稳定的 CDN 地址
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

      try {
        // 修改加载顺序，确保依赖关系正确
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        console.log('模型加载成功');

        // 加载预设的人脸图片
        const img = await faceapi.fetchImage('/authorized-face.jpg');
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
          setAuthorizedDescriptor(detection.descriptor);
          setIsModelLoaded(true);
          console.log('人脸特征提取成功');
        }
      } catch (error) {
        console.error('模型加载失败:', error);
      }
    };

    loadFaceModels();
  }, []);

  // 绘制人脸检测框
  const drawFaceDetection = useCallback(async (detection: any) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;

    if (!canvas || !video) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetection = faceapi.resizeResults(detection, displaySize);

    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetection);
  }, []);

  // 修改人脸识别逻辑
  const performFaceRecognition = useCallback(async () => {
    if (!webcamRef.current || !authorizedDescriptor) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const detection = await faceapi
        .detectSingleFace(
          img,
          new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_CONFIG.MIN_DETECTION_CONFIDENCE })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        await drawFaceDetection(detection);

        const distance = faceapi.euclideanDistance(detection.descriptor, authorizedDescriptor);
        const matchScore = 1 - distance;

        updateDetectionState({
          isDetected: true,
          progress: Math.min((attempts / FACE_CONFIG.MAX_ATTEMPTS) * 100, 100),
          message: `检测到人脸 (匹配度: ${(matchScore * 100).toFixed(1)}%)`,
        });

        if (distance < FACE_CONFIG.MATCH_THRESHOLD) {
          return true;
        }
      } else {
        updateDetectionState({
          isDetected: false,
          message: '未检测到人脸，请调整位置',
        });
      }
    } catch (error) {
      console.error('人脸识别错误:', error);
      updateDetectionState({
        status: 'error',
        message: '识别过程出错，请重试',
      });
    }
    return false;
  }, [authorizedDescriptor, attempts, drawFaceDetection, updateDetectionState]);

  // 修改开始识别函数
  const startFaceRecognition = useCallback(() => {
    // 立即更新初始状态
    setIsFaceMode(true);
    setAttempts(0);
    setSuccessfulFrames(0);

    // 确保状态立即更新
    updateDetectionState({
      status: 'detecting',
      progress: 0,
      matchScore: 0,
      message: '请将脸部对准摄像头',
      isDetected: false,
    });

    // 使用 setTimeout 确保状态已更新后再开始计时器
    setTimeout(() => {
      const timer = setInterval(async () => {
        setAttempts((prev) => {
          const newAttempts = prev + 1;
          const progress = (newAttempts / FACE_CONFIG.MAX_ATTEMPTS) * 100;

          // 使用函数式更新确保状态同步
          updateDetectionState((state) => ({
            ...state,
            progress: progress,
            message: state.isDetected ? state.message : '请将脸部对准摄像头',
          }));

          if (newAttempts >= FACE_CONFIG.MAX_ATTEMPTS) {
            clearInterval(timer);
            stopFaceRecognition();
            showToast('识别超时，请重试', 'error');
            return prev;
          }
          return newAttempts;
        });

        const isSuccess = await performFaceRecognition();

        if (isSuccess) {
          updateDetectionState({
            status: 'success',
            message: '识别成功！',
          });
          showToast('人脸识别成功！', 'success');
          clearInterval(timer);
          setLoading(true);

          setTimeout(() => {
            stopFaceRecognition();
            setLoading(false);
            navigate('/home');
          }, 1000);
        }
      }, FACE_CONFIG.DETECTION_INTERVAL);

      setRecognitionTimer(timer);
    }, 0);
  }, [performFaceRecognition, navigate, showToast, stopFaceRecognition, updateDetectionState]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      if (recognitionTimer) {
        clearInterval(recognitionTimer);
      }
    };
  }, [recognitionTimer]);

  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          {isFaceMode ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-white p-4 rounded-xl shadow-lg">
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg"
                  mirrored={true}
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                {/* 状态提示层 */}
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span>{detectionState.message}</span>
                    {detectionState.status === 'detecting' && <span>{Math.round(detectionState.progress)}%</span>}
                  </div>
                  {detectionState.status === 'detecting' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${detectionState.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <LoadingSpinner />
                    <span className="ml-2 text-white">识别中...</span>
                  </div>
                )}
              </div>
              <button
                onClick={stopFaceRecognition}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
                  <div className="p-8">
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-center text-[#000000] mb-6">
                      欢迎回来
                    </motion.h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}>
                        <label htmlFor="email" className="block text-sm font-medium text-[#000000]">
                          邮箱
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-80 border border-[#e6e6e6] rounded-md text-[#000000] placeholder-[#96989a] focus:outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent transition duration-200"
                          placeholder="请输入您的邮箱"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-[#000000]">
                          密码
                        </label>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-80 border border-[#e6e6e6] rounded-md text-[#000000] placeholder-[#96989a] focus:outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent transition duration-200"
                          placeholder="请输入您的密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-[#626669]" />
                          ) : (
                            <Eye className="h-5 w-5 text-[#626669]" />
                          )}
                        </button>
                      </motion.div>
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#d5001c] hover:bg-[#e5001e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d5001c] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? (
                            <>
                              <LoadingSpinner />
                              <span className="ml-2">登录中...</span>
                            </>
                          ) : (
                            '登录'
                          )}
                        </button>
                      </motion.div>
                    </form>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-6 text-center">
                      <a href="#" className="text-sm text-[#0061bd] hover:text-[#0080fa] transition duration-200">
                        忘记密码？
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 text-center">
                  <p className="text-sm text-[#626669]">
                    还没有账号？{' '}
                    <a href="#" className="font-medium text-[#0061bd] hover:text-[#0080fa] transition duration-200">
                      立即注册
                    </a>
                  </p>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4">
                <button
                  type="button"
                  onClick={startFaceRecognition}
                  disabled={!isModelLoaded || loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#357abd] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Camera className="w-5 h-5" />
                  {isModelLoaded ? '使用人脸识别' : '加载人脸模型中...'}
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
