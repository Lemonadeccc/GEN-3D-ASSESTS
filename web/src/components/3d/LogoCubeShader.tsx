'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface LogoCubeShaderProps {
  time?: number;
  flowSpeed?: number;
}

export function LogoCubeShader({ time = 0, flowSpeed = 1.0 }: LogoCubeShaderProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const currentTime = state.clock.elapsedTime;
      materialRef.current.uniforms.time.value = currentTime;
      materialRef.current.uniforms.flowSpeed.value = flowSpeed;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      transparent
      uniforms={{
        time: { value: 0 },
        flowSpeed: { value: flowSpeed },
        // 简洁的项目配色方案 - 以白色为主
        colorBase: { value: new THREE.Color('#f8fafc') },    // 浅灰白 (slate-50)
        colorWhite: { value: new THREE.Color('#ffffff') },   // 纯白色
        colorLight: { value: new THREE.Color('#e2e8f0') },   // 浅灰 (slate-200)
        colorBlue: { value: new THREE.Color('#3b82f6') },    // 蓝色 (blue-500)
        colorAccent: { value: new THREE.Color('#1d4ed8') },  // 深蓝 (blue-700)
      }}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          
          // 轻微的顶点动画
          vec3 pos = position;
          pos.x += sin(position.y * 4.0 + time * 1.5) * 0.005;
          pos.y += cos(position.x * 4.0 + time * 1.2) * 0.005;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `}
      fragmentShader={`
        uniform float time;
        uniform float flowSpeed;
        uniform vec3 colorBase;
        uniform vec3 colorWhite;
        uniform vec3 colorLight;
        uniform vec3 colorBlue;
        uniform vec3 colorAccent;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vec2 uv = vUv;
          
          // 简单的波纹效果
          float wave1 = sin(uv.x * 8.0 + time * flowSpeed * 1.5) * 0.5 + 0.5;
          float wave2 = cos(uv.y * 6.0 + time * flowSpeed * 1.2) * 0.5 + 0.5;
          
          // 径向渐变
          vec2 center = vec2(0.5, 0.5);
          float dist = length(uv - center);
          
          // 组合波纹
          float pattern = (wave1 * 0.4 + wave2 * 0.4 + (1.0 - dist) * 0.2);
          
          // 主要以白色为基础的颜色映射
          vec3 color;
          if (pattern < 0.3) {
            // 主要区域 - 白色到浅白色
            color = mix(colorLight, colorWhite, pattern / 0.3);
          } else if (pattern < 0.7) {
            // 中间区域 - 白色到淡蓝色
            float t = (pattern - 0.3) / 0.4;
            color = mix(colorWhite, colorBase, t * 0.3);
            color = mix(color, colorBlue, t * 0.1);
          } else {
            // 高亮区域 - 白色带蓝色强调
            float t = (pattern - 0.7) / 0.3;
            color = mix(colorWhite, colorBlue, t * 0.2);
          }
          
          // 边缘轻微发光
          float edgeGlow = 1.0 - smoothstep(0.0, 0.8, dist);
          color = mix(color, colorWhite, edgeGlow * 0.2);
          
          // 轻柔的脉冲
          float pulse = sin(time * flowSpeed * 2.0) * 0.05 + 0.95;
          color *= pulse;
          
          // 边缘蓝色强调
          float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          color = mix(color, colorAccent, fresnel * 0.1);
          
          gl_FragColor = vec4(color, 0.9);
        }
      `}
    />
  );
}