# 前端架构规划

## 📁 项目文件结构

```
web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/
│   │   └── profile/
│   ├── (marketplace)/            # 市场路由组
│   │   ├── explore/
│   │   ├── marketplace/
│   │   └── asset/[tokenId]/
│   ├── generate/                 # AI生成页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── preview/[taskId]/         # 模型预览页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── mint/[modelId]/           # NFT铸造页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── collection/               # 个人收藏页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── history/                  # 交易历史页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── api/                      # API Routes
│   │   ├── meshy/
│   │   │   ├── generate/route.ts
│   │   │   ├── status/route.ts
│   │   │   └── download/route.ts
│   │   ├── ipfs/
│   │   │   ├── upload/route.ts
│   │   │   └── metadata/route.ts
│   │   └── contracts/
│   │       ├── mint/route.ts
│   │       └── query/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                  # 首页
│   ├── loading.tsx
│   └── error.tsx
├── components/                   # 可复用组件
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── badge.tsx
│   ├── layout/                   # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── web3/                     # Web3相关组件
│   │   ├── WalletConnect.tsx
│   │   ├── BalanceDisplay.tsx
│   │   ├── NetworkSelector.tsx
│   │   ├── TransactionModal.tsx
│   │   └── TransactionStatus.tsx
│   ├── 3d/                       # 3D渲染组件
│   │   ├── ModelViewer3D.tsx
│   │   ├── ViewerControls.tsx
│   │   ├── ModelPreview.tsx
│   │   └── QualitySelector.tsx
│   ├── generation/               # AI生成相关组件
│   │   ├── PromptInput.tsx
│   │   ├── GenerationSettings.tsx
│   │   ├── GenerationProgress.tsx
│   │   ├── ModelGallery.tsx
│   │   └── ModelCard.tsx
│   ├── nft/                      # NFT相关组件
│   │   ├── NFTCard.tsx
│   │   ├── NFTGrid.tsx
│   │   ├── NFTMetadataForm.tsx
│   │   ├── PriceCalculator.tsx
│   │   └── MintingStatus.tsx
│   ├── marketplace/              # 市场相关组件
│   │   ├── MarketplaceHeader.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── FeaturedSection.tsx
│   │   └── AssetCard.tsx
│   └── common/                   # 通用组件
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       ├── ImageUpload.tsx
│       └── CopyToClipboard.tsx
├── lib/                          # 工具库和配置
│   ├── utils.ts                  # 通用工具函数
│   ├── web3/                     # Web3配置和工具
│   │   ├── config.ts
│   │   ├── contracts.ts
│   │   ├── providers.ts
│   │   └── hooks.ts
│   ├── meshy/                    # Meshy AI SDK
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── ipfs/                     # IPFS配置
│   │   ├── client.ts
│   │   ├── uploader.ts
│   │   └── types.ts
│   ├── database/                 # 数据库相关 (可选)
│   │   ├── client.ts
│   │   └── schema.ts
│   └── constants/
│       ├── contracts.ts
│       ├── networks.ts
│       └── config.ts
├── hooks/                        # 自定义Hooks
│   ├── use-web3.ts              # Web3连接和状态
│   ├── use-meshy.ts             # Meshy AI API调用
│   ├── use-ipfs.ts              # IPFS上传
│   ├── use-nft-contract.ts      # NFT合约交互
│   ├── use-local-storage.ts     # 本地存储
│   └── use-debounce.ts          # 防抖处理
├── store/                        # 状态管理
│   ├── index.ts                 # Store入口
│   ├── slices/
│   │   ├── user-slice.ts        # 用户状态
│   │   ├── generation-slice.ts  # 生成状态
│   │   ├── web3-slice.ts        # Web3状态
│   │   └── marketplace-slice.ts # 市场状态
│   └── providers/
│       ├── StoreProvider.tsx
│       ├── Web3Provider.tsx
│       └── QueryProvider.tsx
├── types/                        # TypeScript类型定义
│   ├── index.ts
│   ├── meshy.ts                 # Meshy AI相关类型
│   ├── web3.ts                  # Web3相关类型
│   ├── nft.ts                   # NFT相关类型
│   └── api.ts                   # API响应类型
└── styles/                       # 样式文件
    ├── globals.css
    ├── components.css
    └── animations.css
```

## 🧩 核心组件设计

### 1. 3D模型查看器组件

```typescript
// components/3d/ModelViewer3D.tsx
interface ModelViewer3DProps {
  modelUrl: string;
  quality: 'low' | 'medium' | 'high';
  autoRotate?: boolean;
  controls?: boolean;
  lighting?: 'studio' | 'outdoor' | 'soft';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function ModelViewer3D({ 
  modelUrl, 
  quality, 
  autoRotate = false,
  controls = true,
  lighting = 'studio',
  onLoad,
  onError
}: ModelViewer3DProps) {
  // React Three Fiber实现
}
```

### 2. Prompt输入组件

```typescript
// components/generation/PromptInput.tsx
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  suggestions?: string[];
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  suggestions = []
}: PromptInputProps) {
  // 智能提示输入实现
}
```

### 3. Web3钱包连接组件

```typescript
// components/web3/WalletConnect.tsx
interface WalletConnectProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showBalance?: boolean;
  showNetwork?: boolean;
}

export function WalletConnect({
  variant = 'default',
  size = 'md',
  showBalance = true,
  showNetwork = true
}: WalletConnectProps) {
  // 钱包连接逻辑
}
```

### 4. NFT卡片组件

```typescript
// components/nft/NFTCard.tsx
interface NFTCardProps {
  nft: NFTItem;
  variant?: 'grid' | 'list' | 'featured';
  showPrice?: boolean;
  showOwner?: boolean;
  onClick?: (nft: NFTItem) => void;
  onFavorite?: (tokenId: string) => void;
}

export function NFTCard({
  nft,
  variant = 'grid',
  showPrice = true,
  showOwner = true,
  onClick,
  onFavorite
}: NFTCardProps) {
  // NFT卡片实现
}
```

## 🔧 技术栈集成

### 1. React Three Fiber配置

```typescript
// lib/3d/setup.ts
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PresentationControls } from '@react-three/drei';

export function ThreeCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Environment preset="studio" />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      {children}
    </Canvas>
  );
}
```

### 2. Web3配置 (wagmi + viem)

```typescript
// lib/web3/config.ts
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
});
```

### 3. 状态管理 (Zustand)

```typescript
// store/slices/generation-slice.ts
interface GenerationState {
  currentTask: string | null;
  progress: number;
  results: Model3D[];
  settings: GenerationSettings;
  isGenerating: boolean;
}

interface GenerationActions {
  setCurrentTask: (taskId: string | null) => void;
  updateProgress: (progress: number) => void;
  addResult: (model: Model3D) => void;
  updateSettings: (settings: Partial<GenerationSettings>) => void;
  startGeneration: () => void;
  stopGeneration: () => void;
}

export const useGenerationStore = create<GenerationState & GenerationActions>((set) => ({
  // 状态实现
}));
```

### 4. API路由设计

```typescript
// app/api/meshy/generate/route.ts
export async function POST(request: Request) {
  try {
    const { prompt, settings } = await request.json();
    
    // 调用Meshy AI API
    const response = await meshyClient.createTask({
      prompt,
      ...settings
    });
    
    return NextResponse.json({
      success: true,
      taskId: response.task_id
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 🎨 样式系统

### 1. Tailwind配置

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        nft: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        web3: {
          success: '#10B981',
          pending: '#F59E0B',
          error: '#EF4444',
        }
      },
      animation: {
        'model-rotate': 'rotate 10s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 2. 设计系统

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    /* NFT主题色彩 */
    --nft-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --web3-glow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
}

@layer components {
  .model-viewer {
    @apply relative w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800;
  }
  
  .nft-card {
    @apply bg-card rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300;
    @apply border border-border hover:border-primary/50;
  }
  
  .web3-button {
    @apply bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg;
    @apply hover:from-blue-600 hover:to-purple-700 transition-all duration-200;
    @apply shadow-lg hover:shadow-xl;
  }
}
```

## 📱 响应式设计

### 1. 断点策略

```typescript
// lib/constants/breakpoints.ts
export const breakpoints = {
  sm: '640px',   // 手机
  md: '768px',   // 平板
  lg: '1024px',  // 桌面
  xl: '1280px',  // 大屏
  '2xl': '1536px' // 超大屏
} as const;

export const useBreakpoint = () => {
  // 断点检测Hook实现
};
```

### 2. 移动端优化

```typescript
// components/layout/MobileLayout.tsx
export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 移动端导航 */}
      <MobileHeader />
      
      {/* 主要内容 */}
      <main className="pb-16">
        {children}
      </main>
      
      {/* 底部导航 */}
      <MobileTabBar />
    </div>
  );
}
```

## 🔄 数据流管理

### 1. React Query集成

```typescript
// lib/react-query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      cacheTime: 1000 * 60 * 30, // 30分钟
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});
```

### 2. 自定义查询Hooks

```typescript
// hooks/use-nft-collection.ts
export function useNFTCollection(address: string) {
  return useQuery({
    queryKey: ['nft-collection', address],
    queryFn: () => fetchUserNFTs(address),
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // 2分钟
  });
}

export function useGenerationTask(taskId: string) {
  return useQuery({
    queryKey: ['generation-task', taskId],
    queryFn: () => fetchTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (data) => {
      // 任务完成后停止轮询
      return data?.status === 'completed' ? false : 2000;
    },
  });
}
```

---

*架构版本: v1.0*  
*更新时间: 2025-08-16*