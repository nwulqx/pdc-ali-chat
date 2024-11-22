import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  PerformanceMonitor,
  AccumulativeShadows,
  RandomizedLight,
  Environment,
  OrbitControls,
} from '@react-three/drei';
import { Porsche } from './components/Porsche';
import { CameraRig } from './components/CameraRig';
import { Lightformers } from './components/Lightformers';
import './styles.css';

export default function CarModel() {
  const [degraded, degrade] = useState(false);

  return (
    <div className="flex-1 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-3xl overflow-hidden h-[calc(100vh-8rem)]">
      <Canvas shadows camera={{ position: [5, 0, 15], fov: 30 }}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={20} />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={2} shadow-bias={-0.0001} />
        <ambientLight intensity={0.5} />
        <Porsche scale={1.6} position={[-0.5, -0.18, 0]} rotation={[0, Math.PI / 5, 0]} />
        <AccumulativeShadows position={[0, -1.16, 0]} frames={100} alphaTest={0.9} scale={10}>
          <RandomizedLight amount={8} radius={10} ambient={0.5} position={[1, 5, -1]} />
        </AccumulativeShadows>
        <PerformanceMonitor onDecline={() => degrade(true)} />
        <Environment frames={degraded ? 1 : Infinity} resolution={256} background blur={1}>
          <Lightformers />
        </Environment>
      </Canvas>
    </div>
  );
}
