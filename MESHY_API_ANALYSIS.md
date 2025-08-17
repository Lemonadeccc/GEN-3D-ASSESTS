# Meshy AI API 完整功能分析

## 📋 API 功能概览

基于官方文档的详细分析，Meshy AI提供了比我们最初设计更丰富的功能集合。

### 🎯 核心生成功能

#### 1. Text to 3D API
**功能**: 从文本描述生成3D模型
**工作流程**: 
- **Preview模式** (5 credits): 生成基础网格，无纹理
- **Refine模式** (10 credits): 为preview网格添加纹理

**关键参数**:
```typescript
interface TextTo3DParams {
  mode: 'preview' | 'refine';
  prompt: string; // 最大600字符
  art_style: 'realistic' | 'sculpture';
  ai_model: 'meshy-4' | 'meshy-5'; // 默认meshy-5
  topology: 'quad' | 'triangle'; // 默认triangle
  target_polycount: number; // 100-300,000
  should_remesh: boolean;
  symmetry_mode: 'off' | 'auto' | 'on'; // 默认auto
  negative_prompt?: string;
  seed?: number; // 一致性生成
}
```

**输出格式**: GLB, FBX, OBJ, MTL, USDZ
**特色功能**: PBR材质生成、对称性控制、多边形数量控制

#### 2. Image to 3D API
**功能**: 从单张图片生成3D模型
**支持格式**: JPG, JPEG, PNG
**输入方式**: 
- 公开URL
- Base64编码的data URI

**关键参数**:
```typescript
interface ImageTo3DParams {
  image_url: string;
  should_texture: boolean; // false=5学分, true=15学分
  ai_model: 'meshy-4' | 'meshy-5';
  topology: 'quad' | 'triangle';
  target_polycount: number;
  symmetry_mode: 'off' | 'auto' | 'on';
  enable_pbr: boolean; // PBR材质生成
}
```

### 🎨 高级纹理功能

#### 3. Text to Texture API
**功能**: 为现有3D模型生成纹理
**输入**: 
- 现有Meshy任务ID
- 公开的GLB模型URL

**特色功能**:
- 文本驱动的纹理生成
- 图片参考纹理生成  
- PBR材质映射 (金属度、粗糙度、法线)
- UV映射选项

#### 4. Retexture API (10 credits)
**功能**: 重新为模型添加纹理
**支持格式**: GLB输入，GLB/FBX/USDZ输出

**关键参数**:
```typescript
interface RetextureParams {
  input_task_id?: string;
  model_url?: string;
  text_style_prompt?: string; // 最大600字符
  image_style_url?: string;
  ai_model: 'meshy-4' | 'meshy-5';
  enable_original_uv: boolean;
  enable_pbr: boolean;
}
```

### ⚙️ 网格处理功能

#### 5. Remesh API (5 credits)
**功能**: 网格重构和优化
**主要用途**:
- 调整多边形数量
- 改变拓扑结构
- 格式转换
- 模型缩放

**关键参数**:
```typescript
interface RemeshParams {
  input_task_id?: string;
  model_url?: string;
  target_formats: string[]; // GLB, FBX, OBJ, USDZ, STL, Blender
  topology: 'quad' | 'triangle';
  target_polycount: number; // 100-300,000
  resize_height?: number; // 米为单位
  origin_at: 'bottom' | 'center';
}
```

### 🎭 动画功能

#### 6. Auto-Rigging & Animation API
**绑定功能** (5 credits):
- 自动为人形模型创建骨骼
- 要求: 纹理化的人形模型
- 不支持: 无纹理、非人形、结构不清晰的模型

**动画功能** (3 credits):
- 基础动画: 行走、跑步
- 输出格式: GLB, FBX
- 后处理: FPS调整、USDZ转换

```typescript
interface RiggingParams {
  input_task_id?: string;
  model_url?: string;
  character_height: number; // 默认1.7米
  texture_image_url?: string;
  animation_type?: 'walking' | 'running';
}
```

### 💰 系统功能

#### 7. Balance API
**功能**: 查询账户余额
**端点**: `GET /openapi/v1/balance`
**响应**: `{ "balance": 1000 }`

#### 8. 认证系统
**API密钥格式**: `msy_<random-string>`
**认证方式**: `Authorization: Bearer {API_KEY}`
**测试密钥**: `msy_dummy_api_key_for_test_mode_12345678`

### 📊 费用结构

| 功能 | 费用 (Credits) |
|------|----------------|
| Text to 3D (Preview) | 5 |
| Text to 3D (Refine) | 10 |
| Image to 3D (无纹理) | 5 |
| Image to 3D (有纹理) | 15 |
| Text to Texture | 10 |
| Retexture | 10 |
| Remesh | 5 |
| Auto-Rigging | 5 |
| Animation | 3 |

### ⚠️ 限制和约束

#### 技术限制
- **Prompt长度**: 最大600字符
- **多边形数量**: 100-300,000 (根据用户等级)
- **文件格式**: 主要支持GLB, FBX, OBJ, USDZ
- **图片格式**: JPG, JPEG, PNG
- **动画支持**: 仅限人形模型

#### 业务限制
- **资产保留**: 标准用户3天，企业用户无限期
- **付费模式**: 预付费信用点系统
- **下载窗口**: 3天内必须下载模型

### 🆕 发现的新功能机会

基于API分析，我们可以在原设计基础上增加以下功能：

#### 1. 多图片到3D功能
```typescript
// 发现Meshy支持Multi Image to 3D
interface MultiImageTo3D {
  images: string[]; // 多角度图片
  should_texture: boolean;
  // 费用与单图片相同: 5-15 credits
}
```

#### 2. 高级模型编辑器
```typescript
// 基于Remesh API的模型编辑功能
interface ModelEditor {
  changeTopology: (from: 'quad' | 'triangle') => void;
  adjustPolycount: (target: number) => void;
  resizeModel: (height: number) => void;
  changeOrigin: (position: 'bottom' | 'center') => void;
  convertFormat: (formats: string[]) => void;
}
```

#### 3. 动画预览系统
```typescript
// 基于Rigging API的动画功能
interface AnimationSystem {
  autoRig: (model: string) => Promise<RiggedModel>;
  applyAnimation: (type: 'walking' | 'running') => Promise<AnimatedModel>;
  previewAnimation: () => void;
  exportAnimated: (format: 'glb' | 'fbx') => void;
}
```

#### 4. 纹理工作坊
```typescript
// 基于Retexture API的纹理编辑
interface TextureWorkshop {
  retextureFromText: (prompt: string) => void;
  retextureFromImage: (imageUrl: string) => void;
  generatePBR: () => Promise<PBRMaps>;
  preserveUV: (enable: boolean) => void;
}
```

## 🎨 对现有设计的影响

### 需要增强的功能模块

#### 1. AI生成模块增强
- **多阶段生成**: Preview → Refine工作流
- **高级参数**: 对称性、拓扑选择、多边形控制
- **多图片输入**: 支持多角度图片生成
- **纹理独立控制**: 可选择仅生成几何或包含纹理

#### 2. 新增模型编辑模块
- **网格优化器**: 基于Remesh API
- **纹理工作坊**: 基于Retexture API  
- **动画绑定器**: 基于Rigging API
- **格式转换器**: 支持多种输出格式

#### 3. 增强的预览器
- **动画预览**: 支持rigged模型的动画播放
- **PBR材质预览**: 金属度、粗糙度、法线贴图
- **多格式切换**: 实时切换不同文件格式

#### 4. 费用管理系统
- **余额显示**: 实时显示可用credits
- **费用计算器**: 预估操作成本
- **使用统计**: 追踪API使用情况

### 🚀 新的业务机会

#### 1. 专业版功能
- **批量处理**: 批量remesh和retexture
- **模型优化服务**: 为游戏/VR优化多边形数量
- **动画角色生成**: 直接生成可动画的角色

#### 2. 创作者工具
- **纹理变体生成**: 同一模型的多种纹理风格
- **LOD生成**: 自动生成不同细节级别的模型
- **格式适配**: 为不同平台优化模型格式

#### 3. 教育/学习功能
- **3D建模教程**: 展示从preview到refine的过程
- **材质学习**: PBR材质的可视化解释
- **动画原理**: 骨骼绑定和动画的演示

---

*分析版本: v1.0*  
*更新时间: 2025-08-16*  
*基于Meshy AI官方文档: docs.meshy.ai*