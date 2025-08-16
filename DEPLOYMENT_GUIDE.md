# 部署指南 - GEN-3D-ASSETS

## 📋 CI/CD 配置检查结果

### ✅ 当前 CI 配置状态

您的 CI 配置文件已完善，包含以下功能：

- **代码质量检查**: ESLint + Prettier 自动化检查
- **智能合约测试**: Foundry 测试和构建
- **前端构建**: Next.js 应用构建验证
- **提交信息验证**: Commitlint 规范检查

### 🔧 CI 配置优化

已将配置更新为最新版本：

- Node.js: v22 (匹配本地环境)
- pnpm: v9 (最新稳定版本)
- pnpm-setup action: v4 (最新版本)

## 🚀 远程仓库设置指南

### 1. 创建 GitHub 仓库

```bash
# 1. 在 GitHub 上创建新仓库
# 访问: https://github.com/new
# 仓库名: GEN-3D-ASSETS
# 描述: [见下方推荐描述]
# 可见性: Public (推荐) 或 Private

# 2. 不要初始化 README、.gitignore 或 license (本地已有)
```

### 2. 连接远程仓库

```bash
# 在项目根目录执行
cd /Users/lemonade/Downloads/github/GEN-3D-ASSETS

# 添加远程仓库 (替换为您的用户名)
git remote add origin https://github.com/YOUR_USERNAME/GEN-3D-ASSETS.git

# 推送到远程仓库
git branch -M main  # 将 master 分支重命名为 main
git push -u origin main

# 验证远程连接
git remote -v
```

### 3. GitHub 仓库描述推荐

#### 短描述 (用于仓库首页)

```
🤖 AI-powered 3D Assets NFT Platform - Transform ideas into blockchain-verified digital assets
```

#### 详细描述 (README 已包含)

```
基于 AI 生成的 3D 资产 NFT 平台，使用 Meshy AI 将文本 prompt 转换为高质量 3D 模型，
支持 NFT 铸造、展示、交易和下载。技术栈：Next.js 14 + React Three Fiber + Foundry + Web3
```

#### Topics 标签推荐

```
3d-assets, nft, ai-generated, blockchain, nextjs, react-three-fiber,
foundry, web3, typescript, solidity, meshy-ai, ipfs
```

## 🔐 GitHub Secrets 配置

### 必需的 Secrets

访问 `https://github.com/YOUR_USERNAME/GEN-3D-ASSETS/settings/secrets/actions`

#### 1. 基础部署 Secrets (暂时可选)

```
# Vercel 部署 (当需要自动部署时)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# IPFS/Pinata (当需要自动化上传时)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
```

#### 2. 私钥管理 (用于合约部署)

```
# 测试网部署
SEPOLIA_PRIVATE_KEY=your_test_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key

# 主网部署 (后期需要时)
MAINNET_PRIVATE_KEY=your_mainnet_private_key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key
```

### 🔒 安全注意事项

1. **永远不要提交私钥到代码仓库**
2. **使用专门的部署钱包，不要使用主钱包**
3. **测试网和主网使用不同的钱包**
4. **定期轮换 API 密钥**

## 🌐 当前 CI 流程说明

### 触发条件

- **Push 到**: `main`, `master`, `develop` 分支
- **PR 到**: `main`, `master` 分支

### 执行步骤

1. **代码检出** → **环境设置** → **依赖安装**
2. **代码检查** (ESLint + Prettier)
3. **合约构建** (Foundry)
4. **合约测试** (Forge Test)
5. **前端构建** (Next.js)
6. **提交信息验证** (仅 PR)

### 🚨 当前需要解决的问题

#### ⚠️ 暂时跳过的步骤

```yaml
# 前端测试暂时跳过 (第48行)
if: false # 暂时跳过，等有测试文件时启用
```

**建议**: 创建基础测试文件后启用

## 📝 下一步操作清单

### 立即可做

- [ ] 创建 GitHub 仓库
- [ ] 连接远程仓库并推送代码
- [ ] 验证 CI 流程是否正常运行

### 后续配置 (开发进行时)

- [ ] 配置 Vercel 自动部署
- [ ] 设置 Pinata IPFS 集成
- [ ] 配置合约部署密钥
- [ ] 添加前端测试文件并启用测试

### 可选增强

- [ ] 配置 Dependabot 自动更新依赖
- [ ] 添加 CodeQL 安全扫描
- [ ] 设置 Codecov 测试覆盖率
- [ ] 配置自动化 changelog 生成

## 🔧 故障排除

### CI 失败常见原因

1. **pnpm 缓存问题**: 清除 Actions 缓存重试
2. **Node.js 版本不匹配**: 检查本地和 CI 版本一致性
3. **依赖安装失败**: 检查 pnpm-lock.yaml 是否提交
4. **Foundry 工具链**: 确保合约代码无语法错误

### 本地测试 CI 流程

```bash
# 模拟 CI 流程本地执行
pnpm run lint
pnpm run build:contracts
pnpm run test:contracts
pnpm run --filter web build
```

## 🎯 成功标准

✅ **CI 配置完成标志**:

- GitHub Actions 显示绿色 ✓
- 所有检查步骤通过
- 提交信息符合规范
- 代码质量检查通过

---

_更新时间: 2025-08-16_  
_版本: v1.0_
