'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight,
  Zap
} from 'lucide-react';

const processSteps = [
  { step: '01', title: 'AI Generate', desc: 'Input text or upload images' },
  { step: '02', title: 'Preview & Edit', desc: 'Preview model and optimize editing' },
  { step: '03', title: 'Texture Enhance', desc: 'Optional texture regeneration' },
  { step: '04', title: 'NFT Minting', desc: 'Mint as unique NFT' },
];

const stats = [
  { label: 'Generated Models', value: '10K+' },
  { label: 'Active Users', value: '1K+' },
  { label: 'NFT Trades', value: '500+' },
];

export function THomepage() {
  return (
    <div className="flex flex-col gap-16 h-full">
      {/* 中央主要内容区域 */}
      <div className="flex flex-col gap-2 flex-1 justify-center items-center text-center">
        {/* 主标题 - 按照T文件夹风格的大标题 */}
        <h1 className="text-[5.5rem] leading-[5.5rem] anim-r opacity-0 ![animation-delay:200ms] font-bold">
          3D NFT GENERATOR
        </h1>
        <h2 className="text-[3rem] leading-[3rem] anim-r opacity-0 ![animation-delay:300ms] text-neutral-700">
          AI-Powered Digital Assets
        </h2>
        
        {/* 副标题和描述 */}
        <div className="mt-8 space-y-4 anim-b opacity-0 ![animation-delay:400ms] flex flex-col items-center">
          <Badge variant="secondary" className="text-sm">
            🚀 Transform Ideas into 3D NFT Assets
          </Badge>
          <p className="text-xl text-neutral-600 max-w-2xl">
            Generate unique 3D models from text or images using AI technology, with advanced editing and animation support, then mint as NFTs
          </p>
        </div>

        {/* 主要操作按钮 */}
        <div className="flex gap-4 mt-8 anim-b opacity-0 ![animation-delay:500ms]">
          <Button size="lg" asChild className="bg-neutral-900 hover:bg-neutral-800">
            <Link href="/generate">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Generate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/marketplace">
              <Zap className="mr-2 h-5 w-5" />
              Browse Market
            </Link>
          </Button>
        </div>
      </div>

      {/* 底部内容区域 - 保留原有的Web内容风格但采用T布局 */}
      <div className="flex justify-between items-end">
        {/* 左下角区域 - 流程展示和统计 */}
        <div className="flex gap-12 items-stretch anim-b opacity-0 ![animation-delay:200ms]">
          {/* 流程步骤 */}
          <div className="flex flex-col justify-center items-start border px-6 py-4">
            <span className="text-sm text-neutral-600">Process</span>
            <span className="font-bold">4 Steps</span>
          </div>
          
          {/* 流程详情 */}
          <div className="flex flex-col gap-2">
            {processSteps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-4 text-sm">
                <span className="font-mono text-neutral-500">{step.step}</span>
                <span className="font-medium">{step.title}</span>
                <span className="text-neutral-600">{step.desc}</span>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                )}
              </div>
            ))}
          </div>

          {/* 统计数据 */}
          <div className="flex flex-col gap-2 pl-8 border-l">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-sm text-neutral-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右下角 - 版权信息 */}
        <div className="anim-b opacity-0 ![animation-delay:300ms] text-right text-sm text-neutral-600">
          2025 GEN-3D-ASSETS<br/>
          AI-Powered NFT Platform
        </div>
      </div>
    </div>
  );
}