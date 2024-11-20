import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Navigation, User, Sun, Moon, Globe, Music, Car, Calendar, Settings, Coffee } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function CarSystemHomepage() {
  const [conversation, setConversation] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('中文');
  const [voice, setVoice] = useState('默认');
  const carModelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (conversation.length < 5) {
        setConversation((prev) => [...prev, '系统：有什么可以帮助您的吗？']);
      } else {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [conversation]);

  useEffect(() => {
    if (carModelRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        carModelRef.current.clientWidth / carModelRef.current.clientHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(carModelRef.current.clientWidth, carModelRef.current.clientHeight);
      carModelRef.current.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(1, 2, 1);
      scene.add(directionalLight);

      const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.8);
      secondaryLight.position.set(-1, 1, -1);
      scene.add(secondaryLight);

      const loader = new GLTFLoader();
      loader.load(
        '/porsche_gt3_rs.glb',
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(2.0, 2.0, 2.0);
          scene.add(model);

          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.25;
          controls.screenSpacePanning = false;
          controls.maxPolarAngle = Math.PI / 2;

          camera.position.set(5, 3, 5);
          camera.lookAt(0, 0, 0);

          const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };
          animate();
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the model:', error);
        }
      );

      return () => {
        if (carModelRef.current) {
          carModelRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      setConversation((prev) => [...prev, `用户：${inputText}`]);
      setInputText('');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === '中文' ? 'English' : '中文');
  };

  const toggleVoice = () => {
    setVoice(voice === '默认' ? '女声' : voice === '女声' ? '男声' : '默认');
  };

  return (
    <div className={`min-h-screen bg-[#f2f2f2] text-[#000000] p-8 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">车载系统-AutoPoss</h1>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            {theme === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            <Globe className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVoice}
            className="bg-[#d5001c] text-white p-2 rounded-full">
            <Music className="w-6 h-6" />
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-full p-2 shadow-lg">
            <User className="w-6 h-6 text-[#d5001c]" />
          </motion.div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex gap-8 flex-grow">
        {/* 左侧应用按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col gap-4">
          {[
            { icon: <Navigation className="w-8 h-8" />, label: '导航' },
            { icon: <Car className="w-8 h-8" />, label: '车辆信息' },
            { icon: <Calendar className="w-8 h-8" />, label: '日程' },
            { icon: <Settings className="w-8 h-8" />, label: '设置' },
            { icon: <Coffee className="w-8 h-8" />, label: '休息提醒' },
          ].map((app, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-4 shadow-lg flex items-center justify-start">
              <div className="text-[#d5001c] mr-4">{app.icon}</div>
              <span className="text-sm font-medium">{app.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* 中央车辆信息 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-[#000000]">车辆信息</h2>
          <div ref={carModelRef} style={{ width: '100%', height: 'calc(100% - 40px)' }} />
        </motion.div>

        {/* 右侧智能助手 */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl p-6 shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-[#000000]">智能助手</h2>
          <div className="flex-grow overflow-y-auto mb-4 space-y-2">
            {conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: message.startsWith('用户') ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-2 rounded-lg ${
                  message.startsWith('用户') ? 'bg-[#d5001c] text-white ml-auto' : 'bg-[#e6e6e6] text-[#000000]'
                } inline-block max-w-3/4`}>
                {message}
              </motion.div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              className="flex-grow bg-white border border-[#e6e6e6] rounded-l-full py-2 px-4 outline-none focus:ring-2 focus:ring-[#d5001c] focus:border-transparent"
              placeholder="输入您的问题..."
            />
            <button type="submit" className="bg-[#d5001c] text-white rounded-r-full p-2">
              <Mic className="w-6 h-6" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
