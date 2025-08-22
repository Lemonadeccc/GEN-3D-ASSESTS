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
        // 符合系统配色的深蓝到亮蓝渐变
        colorDeep: { value: new THREE.Color('#0F172A') }, // 深灰蓝
        colorMid: { value: new THREE.Color('#1E40AF') }, // 蓝色 (blue-700)
        colorBright: { value: new THREE.Color('#3B82F6') }, // 亮蓝 (blue-500)
        colorHighlight: { value: new THREE.Color('#93C5FD') }, // 浅蓝 (blue-300)
      }}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // 添加微妙的顶点波动，创造流动感
          vec3 pos = position;
          pos.x += sin(position.y * 6.0 + time * 2.0) * 0.01;
          pos.y += cos(position.x * 6.0 + time * 1.5) * 0.01;
          pos.z += sin((position.x + position.y) * 4.0 + time * 1.8) * 0.008;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `}
      fragmentShader={`
        uniform float time;
        uniform float flowSpeed;
        uniform vec3 colorDeep;
        uniform vec3 colorMid;
        uniform vec3 colorBright;
        uniform vec3 colorHighlight;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // 多层流动波纹效果
          float wave1 = sin(vUv.x * 10.0 + time * flowSpeed * 2.0) * 0.5 + 0.5;
          float wave2 = cos(vUv.y * 8.0 + time * flowSpeed * 1.7) * 0.5 + 0.5;
          float wave3 = sin((vUv.x + vUv.y) * 6.0 + time * flowSpeed * 2.3) * 0.5 + 0.5;
          
          // 径向波纹
          vec2 center = vec2(0.5, 0.5);
          float dist = length(vUv - center);
          float radialWave = sin(dist * 15.0 - time * flowSpeed * 3.0) * 0.5 + 0.5;
          
          // 组合所有波纹效果
          float combinedWave = (wave1 * 0.3 + wave2 * 0.3 + wave3 * 0.2 + radialWave * 0.2);
          
          // 四色渐变映射
          vec3 color;
          if (combinedWave < 0.25) {
            float t = combinedWave / 0.25;
            color = mix(colorDeep, colorMid, smoothstep(0.0, 1.0, t));
          } else if (combinedWave < 0.5) {
            float t = (combinedWave - 0.25) / 0.25;
            color = mix(colorMid, colorBright, smoothstep(0.0, 1.0, t));
          } else if (combinedWave < 0.75) {
            float t = (combinedWave - 0.5) / 0.25;
            color = mix(colorBright, colorHighlight, smoothstep(0.0, 1.0, t));
          } else {
            float t = (combinedWave - 0.75) / 0.25;
            color = mix(colorHighlight, colorBright, smoothstep(0.0, 1.0, t));
          }
          
          // 添加边缘发光效果
          float edgeGlow = 1.0 - smoothstep(0.0, 0.4, dist);
          color += colorHighlight * edgeGlow * 0.2;
          
          // 添加脉冲效果
          float pulse = sin(time * flowSpeed * 4.0) * 0.1 + 0.9;
          color *= pulse;
          
          gl_FragColor = vec4(color, 0.92);
        }
      `}
    />
  );
}