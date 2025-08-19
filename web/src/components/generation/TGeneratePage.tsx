'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalance, useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TextTo3DParams, TaskStatusResponse } from '@/lib/meshy/types';
import { ClientSideModel3DViewer } from '@/components/3d/ClientSideModel3DViewer';
import { SimpleCubeScene } from '@/components/3d/RotatingCube';
import { storage } from '@/lib/storage';
import { z } from 'zod';
import { 
  Sparkles, 
  Image, 
  Layers,
  Play,
  FileText,
  Settings
} from 'lucide-react';

// Zod schema for prompt validation
const promptSchema = z.string()
  .min(3, "Prompt must be at least 3 characters long")
  .max(600, "Prompt must be 600 characters or less");

interface TGeneratePageProps {
  onTaskCreated?: (taskId: string) => void;
}

export function TGeneratePage({ onTaskCreated }: TGeneratePageProps) {
  // State management
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'multi'>('text');
  const [prompt, setPrompt] = useState('');
  const [promptError, setPromptError] = useState<string>('');
  const [mode, setMode] = useState<'preview' | 'refine'>('preview');
  const [artStyle, setArtStyle] = useState<'realistic' | 'sculpture'>('realistic');
  const [aiModel, setAiModel] = useState<'meshy-4' | 'meshy-5'>('meshy-5');
  const [targetPolycount, setTargetPolycount] = useState(5000);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  // Hooks
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId) as { data: TaskStatusResponse | undefined };

  // Validate prompt on change
  const handlePromptChange = (value: string) => {
    setPrompt(value);
    try {
      promptSchema.parse(value);
      setPromptError('');
    } catch (error) {
      if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
        setPromptError(error.errors[0].message);
      } else {
        setPromptError('Invalid input');
      }
    }
  };

  // Load saved state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreviewTask = storage.getPreviewTaskId();
      if (savedPreviewTask) {
        setPreviewTaskId(savedPreviewTask);
      }
      
      // Load generation history
      const history = storage.getGenerationHistory();
      setGeneratedTasks(history.slice(-10)); // Keep last 10
    }
  }, []);

  // Handle task status updates
  useEffect(() => {
    if (!taskStatus || !currentTaskId) return;
    
    if (taskStatus.id === currentTaskId) {
      if (taskStatus.status === 'SUCCEEDED' && taskStatus.mode === 'preview') {
        setPreviewTaskId(taskStatus.id);
        storage.savePreviewTaskId(taskStatus.id);
      }
      
      if (taskStatus.status === 'SUCCEEDED') {
        storage.saveLastSuccessfulModel(taskStatus);
        setIsGenerating(false);
      }
      
      if (taskStatus.status === 'FAILED') {
        setIsGenerating(false);
      }
    }
  }, [taskStatus, currentTaskId]);

  // Generate 3D model
  const handleGenerate = async () => {
    // Validate prompt before generating
    try {
      promptSchema.parse(prompt);
    } catch (error) {
      if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
        setPromptError(error.errors[0].message);
        return;
      } else {
        setPromptError('Invalid input');
        return;
      }
    }
    
    setIsGenerating(true);
    
    const params: TextTo3DParams = {
      prompt: prompt.trim(),
      mode,
      art_style: artStyle,
      ai_model: aiModel,
      target_polycount: targetPolycount,
      preview_task_id: mode === 'refine' ? previewTaskId : undefined,
    };

    try {
      const result = await textTo3DMutation.mutateAsync(params);
      
      if (result?.result) {
        const taskId = result.result;
        setCurrentTaskId(taskId);
        
        // Update history
        const newHistory = [...generatedTasks, taskId];
        setGeneratedTasks(newHistory.slice(-10));
        storage.saveGenerationHistory(newHistory);
        
        onTaskCreated?.(taskId);
        console.log('✅ Generation started:', taskId);
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex">
      {/* Left Panel - 33% */}
      <div className="w-1/3 p-6 space-y-6 overflow-y-auto">
        {/* Debug Balance */}
        <div className="text-xs text-neutral-500 absolute top-2 left-2">
          Balance: {balanceLoading ? '...' : balance?.balance || 0}
        </div>

        {/* Generation Type Tabs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generation Type</h2>
          <div className="flex flex-col gap-2">
            <Button
              variant={activeTab === 'text' ? 'default' : 'outline'}
              onClick={() => setActiveTab('text')}
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Text to 3D
            </Button>
            <Button
              variant={activeTab === 'image' ? 'default' : 'outline'}
              onClick={() => setActiveTab('image')}
              className="justify-start"
              disabled
            >
              <Image className="mr-2 h-4 w-4" />
              Image to 3D
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </Button>
            <Button
              variant={activeTab === 'multi' ? 'default' : 'outline'}
              onClick={() => setActiveTab('multi')}
              className="justify-start"
              disabled
            >
              <Layers className="mr-2 h-4 w-4" />
              Multi-Image
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </Button>
          </div>
        </div>

        {/* Text Input */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Model Description</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Describe your 3D model in detail..."
                className="min-h-[120px] resize-none"
                maxLength={600}
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>{promptError && <span className="text-red-500">{promptError}</span>}</span>
                <span>{prompt.length}/600</span>
              </div>
            </div>

            {/* Parameters - 2x2 Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Mode</Label>
                  <Select value={mode} onValueChange={(value: 'preview' | 'refine') => setMode(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preview">Preview</SelectItem>
                      <SelectItem value="refine" disabled={!previewTaskId}>
                        Refine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Style</Label>
                  <Select value={artStyle} onValueChange={(value: 'realistic' | 'sculpture') => setArtStyle(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">AI Model</Label>
                  <Select value={aiModel} onValueChange={(value: 'meshy-4' | 'meshy-5') => setAiModel(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meshy-5">Meshy-5</SelectItem>
                      <SelectItem value="meshy-4">Meshy-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Polycount</Label>
                  <Select 
                    value={targetPolycount.toString()} 
                    onValueChange={(value) => setTargetPolycount(parseInt(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000">5K</SelectItem>
                      <SelectItem value="10000">10K</SelectItem>
                      <SelectItem value="20000">20K</SelectItem>
                      <SelectItem value="50000">50K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status info */}
            {taskStatus && (
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge variant={taskStatus.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                      {taskStatus.status}
                    </Badge>
                  </div>
                  {taskStatus.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{taskStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${taskStatus.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !!promptError}
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Start Generate'}
            </Button>
          </div>
        )}
      </div>

      {/* Middle Panel - 33% */}
      <div className="w-1/3 p-6 border-l border-r border-neutral-200">
        <div className="h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">3D Model Preview</h2>
          <div className="flex-1 min-h-[400px]">
            {taskStatus && taskStatus.status === 'SUCCEEDED' ? (
              <ClientSideModel3DViewer 
                taskResult={taskStatus} 
                className="w-full h-full"
                autoDownload={false}
              />
            ) : (
              <SimpleCubeScene />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - 33% */}
      <div className="w-1/3 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Generation History</h2>
        
        {generatedTasks.length === 0 ? (
          <div className="text-center text-neutral-500 mt-12">
            <div className="w-16 h-16 border-2 border-dashed border-neutral-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <p>No generations yet</p>
            <p className="text-sm">Start creating your first 3D model!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedTasks.slice().reverse().map((taskId, index) => (
              <div 
                key={taskId} 
                className="p-3 bg-neutral-50 rounded-lg border cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => setCurrentTaskId(taskId)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <code className="text-xs text-neutral-600 block truncate">
                      {taskId}
                    </code>
                    <div className="text-sm text-neutral-500 mt-1">
                      #{generatedTasks.length - index}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {currentTaskId === taskId ? 'Active' : 'Complete'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}