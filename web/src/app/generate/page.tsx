'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextTo3DGenerator } from '@/components/generation/TextTo3DGenerator';
import { TGeneratePage } from '@/components/generation/TGeneratePage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Sparkles, Image, FileText, Layers, Box } from 'lucide-react';

// Original Generate Page Component
function OriginalGeneratePage() {
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  const handleTaskCreated = (taskId: string) => {
    setGeneratedTasks(prev => [...prev, taskId]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generation Center
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Generate 3D Models
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into high-quality 3D models using Meshy AI
          </p>
        </div>

        {/* Generation Tabs */}
        <Tabs defaultValue="text-to-3d" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text-to-3d" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Text to 3D</span>
            </TabsTrigger>
            <TabsTrigger value="image-to-3d">
              <Image className="h-4 w-4 mr-2" />
              <span>Image to 3D</span>
            </TabsTrigger>
            <TabsTrigger value="multi-image">
              <Layers className="h-4 w-4 mr-2" />
              <span>Multi-Image</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text-to-3d" className="space-y-6">
            <TextTo3DGenerator onTaskCreated={handleTaskCreated} />
          </TabsContent>

          <TabsContent value="image-to-3d" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Image className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Image to 3D</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Generate 3D models from single images - Coming soon...
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">Without Texture</div>
                    <div className="text-muted-foreground">5 Credits</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">With Texture</div>
                    <div className="text-muted-foreground">15 Credits</div>
                  </div>
                </div>
                <Button disabled className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-image" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl">Multi-Image to 3D</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Generate more accurate 3D models using multiple angle images - Coming soon...
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">Without Texture</div>
                    <div className="text-muted-foreground">5 Credits</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">With Texture</div>
                    <div className="text-muted-foreground">15 Credits</div>
                  </div>
                </div>
                <Button disabled className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Tasks */}
        {generatedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Generation Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedTasks.slice(-5).reverse().map((taskId) => (
                  <div key={taskId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm">{taskId}</code>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const [useNewLayout, setUseNewLayout] = useState(true); // 默认使用T-style布局
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  // Load layout preference from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('layout-preference');
    if (savedLayout) {
      setUseNewLayout(savedLayout === 'tStyle');
    } else {
      // 如果没有保存的偏好，默认使用T-style
      setUseNewLayout(true);
    }
  }, []);

  // Toggle layout and save preference
  const toggleLayout = () => {
    const newLayoutState = !useNewLayout;
    setUseNewLayout(newLayoutState);
    localStorage.setItem('layout-preference', newLayoutState ? 'tStyle' : 'original');
  };

  const handleTaskCreated = (taskId: string) => {
    setGeneratedTasks(prev => [...prev, taskId]);
  };

  // T-style layout
  if (useNewLayout) {
    return (
      <LayoutWrapper defaultLayout="tStyle">
        <TGeneratePage onTaskCreated={handleTaskCreated} />
      </LayoutWrapper>
    );
  }

  // Original layout with toggle button
  return (
    <div className="relative">
      {/* Layout toggle button */}
      <div className="fixed top-20 right-4 z-[9999]">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLayout}
          className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-lg border-2"
        >
          <Box className="h-4 w-4" />
          Classic Design
        </Button>
      </div>
      
      <OriginalGeneratePage />
    </div>
  );
}