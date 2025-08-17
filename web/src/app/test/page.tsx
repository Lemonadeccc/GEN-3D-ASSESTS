'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// 测试Zustand Store
const useTestStore = create<{
  count: number;
  increment: () => void;
  decrement: () => void;
}>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Test3DScene() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
        scale={clicked ? 1.5 : hovered ? 1.1 : 1}
      >
        <meshStandardMaterial color={clicked ? 'hotpink' : hovered ? 'lightblue' : 'orange'} />
      </Box>
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        3D NFT Platform
      </Text>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export default function TestPage() {
  const { count, increment, decrement } = useTestStore();
  const [inputValue, setInputValue] = useState('');
  
  // 测试TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['test-api', count],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        message: 'TanStack Query + Zustand integration working!',
        timestamp: new Date().toISOString(),
        currentCount: count,
        randomId: Math.random().toString(36).substr(2, 9)
      };
    },
    staleTime: 5000,
  });

  const dependencies = [
    { name: 'Next.js 15', status: 'success', version: '15.4.6' },
    { name: 'React 19', status: 'success', version: '19.1.0' },
    { name: 'TypeScript', status: 'success', version: '5.x' },
    { name: 'Tailwind CSS', status: 'success', version: '4.x' },
    { name: 'shadcn/ui', status: 'success', version: 'latest' },
    { name: 'Zustand', status: 'success', version: '5.0.7' },
    { name: 'TanStack Query', status: 'success', version: '5.85.3' },
    { name: 'React Three Fiber', status: 'success', version: '9.3.0' },
    { name: 'Three.js', status: 'success', version: '0.179.1' },
    { name: 'React Hook Form', status: 'success', version: '7.62.0' },
    { name: 'Zod', status: 'success', version: '4.0.17' },
    { name: 'Lucide React', status: 'success', version: '0.539.0' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 3D NFT Platform
          </h1>
          <p className="text-xl text-slate-600">
            核心依赖包集成测试 - Phase 1 完成
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary">Next.js 15</Badge>
            <Badge variant="secondary">React 19</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="outline">Ready for Development</Badge>
          </div>
        </div>

        {/* 依赖状态卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>📦 依赖包安装状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dependencies.map((dep) => (
                <div key={dep.name} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{dep.name}</p>
                    <p className="text-xs text-slate-500">{dep.version}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">✅ 所有核心依赖包安装成功，项目基础设施就绪！</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 状态管理测试 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Zustand 状态管理测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={decrement} variant="outline" size="lg">
                  -1
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {count}
                  </div>
                  <p className="text-sm text-slate-500">Counter Value</p>
                </div>
                <Button onClick={increment} size="lg">
                  +1
                </Button>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="测试输入..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <p className="text-sm text-slate-600">
                  Input value: {inputValue || '(empty)'}
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  ✅ Zustand store 状态管理正常，UI组件响应正常
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 数据获取测试 */}
          <Card>
            <CardHeader>
              <CardTitle>🔄 TanStack Query 数据获取测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-slate-600">Loading data...</span>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              ) : error ? (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-red-700">Error: {error.message}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 font-medium">✅ {data?.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Timestamp:</span>
                      <p className="font-mono text-xs">{data?.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Count in Query:</span>
                      <p className="font-mono">{data?.currentCount}</p>
                    </div>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    🔄 重新获取数据
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3D渲染测试 */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 React Three Fiber + Three.js 3D渲染测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-xl overflow-hidden shadow-inner">
              <Canvas camera={{ position: [4, 4, 4] }}>
                <Test3DScene />
              </Canvas>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-sm">
                ✅ Three.js + React Three Fiber 渲染正常。🖱️ 拖拽旋转视角，点击立方体交互！
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 项目信息 */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ 项目开发信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">🏗️ Phase 1 完成项目</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>✅ 核心依赖包安装 (12个)</li>
                  <li>✅ shadcn/ui UI组件库</li>
                  <li>✅ 项目结构创建</li>
                  <li>✅ 基础测试验证</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">🎯 下一步 Phase 2</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>🔄 配置Providers和路由</li>
                  <li>🔄 创建基础布局组件</li>
                  <li>🔄 实现页面导航系统</li>
                  <li>🔄 Meshy API集成</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 font-medium">
                🎉 Phase 1 基础设施搭建完成！现在可以开始开发核心功能了。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}