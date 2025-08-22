'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useLogoAnimation } from '@/store/logoAnimationStore';
import { LogoCubeShader } from './LogoCubeShader';

export function AnimatedLogoCube() {
  const groupRef = useRef<THREE.Group>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);
  
  // 使用Zustand状态
  const { getCurrentSpeed, isHovering } = useLogoAnimation();

  // 创建分割的几何体 - 放大2倍
  const { leftGeometry, rightGeometry } = useMemo(() => {
    // 左半部分几何体 (wireframe) - 原来0.5x1x1，现在1x2x2
    const leftGeo = new THREE.BoxGeometry(1, 2, 2);
    leftGeo.translate(-0.5, 0, 0);
    
    // 右半部分几何体 (shader) - 原来0.5x1x1，现在1x2x2
    const rightGeo = new THREE.BoxGeometry(1, 2, 2);
    rightGeo.translate(0.5, 0, 0);
    
    return { leftGeometry: leftGeo, rightGeometry: rightGeo };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const speed = getCurrentSpeed();
      
      // 复杂但规律的旋转轨迹 - 基于三个不同的频率和相位
      groupRef.current.rotation.x = time * speed * 0.7 + Math.sin(time * 0.3) * 0.2;
      groupRef.current.rotation.y = time * speed * 1.0 + Math.cos(time * 0.5) * 0.3;
      groupRef.current.rotation.z = time * speed * 0.5 + Math.sin(time * 0.7) * 0.1;
      
      // Hover时的缩放效果 - 使用lerp实现平滑过渡
      const targetScale = isHovering ? 1.2 : 1.0;
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.setScalar(newScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 左半部分 - Wireframe */}
      <mesh ref={leftMeshRef} geometry={leftGeometry}>
        <meshBasicMaterial 
          color="#FFFFFF" 
          wireframe 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* 右半部分 - 流动Shader材质 */}
      <mesh ref={rightMeshRef} geometry={rightGeometry}>
        <LogoCubeShader flowSpeed={getCurrentSpeed()} />
      </mesh>
    </group>
  );
}