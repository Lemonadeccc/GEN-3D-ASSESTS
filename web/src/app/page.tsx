// 禁用静态生成
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/web3/Navbar';
import { 
  Sparkles, 
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Coins,
  Palette,
  Box
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI 生成 3D 模型',
    description: '使用先进的 Meshy AI 技术，从文本或图片生成高质量 3D 模型',
    href: '/generate'
  },
  {
    icon: Palette,
    title: '智能纹理编辑',
    description: '支持重新纹理、PBR 材质生成和网格优化',
    href: '/generate'
  },
  {
    icon: Box,
    title: '3D 模型预览',
    description: '实时预览、旋转查看模型，支持多种格式导出',
    href: '/generate'
  },
  {
    icon: Coins,
    title: 'NFT 铸造',
    description: '将 3D 模型铸造为 NFT，确保数字资产的唯一性和所有权',
    href: '/nft'
  },
];

const stats = [
  { label: '生成模型', value: '10K+' },
  { label: '活跃用户', value: '1K+' },
  { label: 'NFT 交易', value: '500+' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              🚀 AI-Powered 3D NFT Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              将创意转化为
              <br />
              3D NFT 资产
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              使用 AI 技术从文本或图片生成独特的 3D 模型，支持高级编辑和动画，最终铸造为 NFT
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/generate">
                <Sparkles className="mr-2 h-5 w-5" />
                开始生成
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/nft">
                <Coins className="mr-2 h-5 w-5" />
                我的NFT
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">强大的功能特性</h2>
            <p className="text-muted-foreground">
              从 AI 生成到 NFT 铸造，一站式 3D 资产创作平台
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={feature.href}>
                    <CardHeader className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-muted/50 rounded-2xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">工作流程</h2>
            <p className="text-muted-foreground">
              简单四步，从创意到 NFT
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'AI 生成', desc: '输入文本或上传图片' },
              { step: '02', title: '预览编辑', desc: '预览模型并进行编辑优化' },
              { step: '03', title: '纹理优化', desc: '可选的纹理重新生成' },
              { step: '04', title: 'NFT 铸造', desc: '铸造为独一无二的 NFT' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block mx-auto mt-4 h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">准备开始创作了吗？</h2>
            <p className="text-muted-foreground">
              加入我们的创作者社区，开始您的 3D NFT 之旅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/generate">
                  <Zap className="mr-2 h-5 w-5" />
                  立即开始生成
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/test">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  查看技术演示
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}