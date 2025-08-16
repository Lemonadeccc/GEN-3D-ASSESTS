# GEN-3D-ASSETS

> AI 驱动的 3D 资产 NFT 平台 - 将创意转化为链上数字资产

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-red.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## 🌟 项目概述

GEN-3D-ASSETS 是一个基于 AI 生成的 3D 资产 NFT 平台。用户可以通过输入文本提示词 (prompt) 或个人信息，使用 Meshy AI 生成个性化的 3D 模型，并将其作为 NFT 保存在区块链上。平台支持 3D 模型的展示、交易和下载功能。

### 🎯 核心功能

- **🤖 AI 生成**: 通过 Meshy AI API 将文本转换为高质量 3D 模型
- **🖼️ 3D 展示**: 基于 React Three Fiber 的交互式 3D 查看器
- **⛓️ NFT 铸造**: 智能合约管理的数字资产所有权
- **💰 交易市场**: 内置的 NFT 交易和拍卖功能
- **📦 文件下载**: 支持 OBJ、GLTF 等多种 3D 格式下载
- **🎨 个性化**: 基于用户画像生成独特的数字资产

## 🏗️ 技术架构

### 核心技术栈

| 层级 | 技术选型 | 用途 |
|------|----------|------|
| **智能合约** | Foundry + Solidity + OpenZeppelin | NFT 管理、市场交易、版税分配 |
| **前端框架** | Next.js 14 + TypeScript + App Router | 现代化 React 应用 |
| **3D 渲染** | React Three Fiber + Three.js + Drei | 3D 模型展示和交互 |
| **区块链集成** | Wagmi v2 + Viem + ConnectKit | 钱包连接和合约交互 |
| **状态管理** | Zustand + TanStack Query | 应用状态和服务端数据 |
| **样式系统** | TailwindCSS + shadcn/ui + Framer Motion | UI 组件和动画 |
| **存储** | IPFS + Pinata | 去中心化文件存储 |
| **部署** | Vercel + GitHub Actions | 自动化部署和 CI/CD |

### 系统架构图

```
用户输入 Prompt → Meshy AI API → 3D 模型生成 → IPFS 存储 → 智能合约铸造 → 前端展示 → 交易/下载
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Foundry 工具链
- Git

### 克隆项目

```bash
git clone https://github.com/your-username/GEN-3D-ASSETS.git
cd GEN-3D-ASSETS
```

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装 Foundry (macOS/Linux)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 环境配置

```bash
# 复制环境变量模板
cp web/.env.example web/.env.local
cp contracts/.env.example contracts/.env

# 编辑环境变量
# web/.env.local
MESHY_API_KEY=your_meshy_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET=your_pinata_secret

# contracts/.env
PRIVATE_KEY=your_wallet_private_key
RPC_URL=your_rpc_url
```

### 本地开发

```bash
# 编译智能合约
cd contracts
forge build

# 启动前端开发服务器
pnpm run dev --workspace=web
```

访问 `http://localhost:3000` 查看应用。

## 📁 项目结构

```
GEN-3D-ASSETS/
├── contracts/          # Foundry 智能合约项目
│   ├── src/
│   │   ├── Asset3D.sol              # 主 NFT 合约
│   │   ├── Asset3DMarketplace.sol   # 市场合约
│   │   └── Asset3DRoyalty.sol       # 版税分配合约
│   ├── test/              # 合约测试
│   └── script/            # 部署脚本
├── web/                # Next.js 前端项目
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   ├── components/    # React 组件
│   │   ├── lib/           # 工具库和配置
│   │   └── types/         # TypeScript 类型
│   └── public/            # 静态资源
├── docs/               # 项目文档
├── .github/            # GitHub Actions CI/CD
└── README.md           # 项目说明
```

## 🎮 使用指南

### 1. 连接钱包
在首页点击"连接钱包"按钮，支持 MetaMask、WalletConnect 等主流钱包。

### 2. 生成 3D 资产
- 进入"创建"页面
- 输入描述性的 prompt（如："一只蓝色的卡通龙"）
- 等待 AI 生成 3D 模型
- 预览并确认模型效果

### 3. 铸造 NFT
- 选择满意的 3D 模型
- 设置资产信息（名称、描述、版税比例）
- 支付 Gas 费用完成链上铸造
- 获得唯一的 NFT 所有权

### 4. 展示和交易
- 在"画廊"中浏览所有 3D 资产
- 查看详细的 3D 模型信息
- 在"市场"中买卖 NFT
- 下载拥有的 3D 模型文件

## 🔧 开发命令

```bash
# 开发
pnpm run dev                    # 启动前端开发服务器
pnpm run dev:contracts         # 启动本地区块链节点

# 构建
pnpm run build                 # 构建前端应用
pnpm run build:contracts      # 编译智能合约

# 测试
pnpm run test                  # 运行所有测试
pnpm run test:contracts       # 运行合约测试
pnpm run test:web             # 运行前端测试

# 代码质量
pnpm run lint                  # 代码检查
pnpm run format               # 代码格式化

# 部署
pnpm run deploy:testnet       # 部署到测试网
pnpm run deploy:mainnet       # 部署到主网
```

## 📜 智能合约

### 主要合约功能

#### Asset3D.sol (ERC-721)
- ✅ NFT 铸造和管理
- ✅ 元数据存储 (IPFS)
- ✅ 版税机制 (EIP-2981)
- ✅ 访问控制

#### Asset3DMarketplace.sol
- ✅ 资产上架和交易
- ✅ 拍卖功能
- ✅ 版税自动分配

#### Asset3DRoyalty.sol
- ✅ 多方收益分成
- ✅ 自动版税分配
- ✅ 收益提取

## 🔐 安全考虑

- ✅ API 密钥服务端保护
- ✅ 输入验证和文件验证  
- ✅ 重入攻击防护
- ✅ 访问控制和权限管理
- ✅ 速率限制和用量控制

## 📊 性能优化

- ✅ 3D 模型 LOD (Level of Detail)
- ✅ 懒加载和预加载策略
- ✅ IPFS CDN 加速
- ✅ Next.js 图像优化
- ✅ 智能缓存策略

## 🛣️ 路线图

### v1.0 - MVP
- [x] 技术选型和架构设计
- [ ] 基础 3D 生成和展示
- [ ] NFT 铸造功能
- [ ] 简单的市场交易

### v1.1 - 增强功能
- [ ] 批量生成和铸造
- [ ] 高级搜索和筛选
- [ ] 移动端优化
- [ ] 多语言支持

### v2.0 - 平台化
- [ ] API 开放平台
- [ ] 插件系统
- [ ] Layer 2 集成
- [ ] 跨链支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详细信息。

## 🔗 相关链接

- [详细实施计划](./IMPLEMENTATION_PLAN.md)
- [项目想法记录](./todos.md)

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！

Made with ❤️ by the GEN-3D-ASSETS team