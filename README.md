# GEN-3D-ASSETS

> AI-Powered 3D Asset NFT Platform - Transform Ideas into On-Chain Digital Assets

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-red.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-latest-brightgreen.svg)](https://getfoundry.sh/)

## 🌟 Project Overview

GEN-3D-ASSETS is an AI-powered 3D asset NFT platform that enables users to generate personalized 3D models using text prompts via Meshy AI and mint them as NFTs on the blockchain. The platform supports 3D model visualization, trading, and downloading with a comprehensive marketplace ecosystem.

### 🎯 Key Features

- **🤖 AI Generation**: Text-to-3D conversion using advanced Meshy AI API
- **🖼️ 3D Visualization**: Interactive 3D viewer powered by React Three Fiber
- **⛓️ NFT Minting**: Smart contract-managed digital asset ownership
- **💰 Marketplace**: Built-in NFT trading and auction system
- **📦 Multi-Format Support**: Download as OBJ, GLTF, and other 3D formats
- **🎨 Personalization**: Generate unique digital assets based on user preferences
- **🔒 Secure Trading**: Automated royalty distribution and secure transactions

## 🏗️ Technical Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Smart Contracts** | Foundry + Solidity 0.8.20 + OpenZeppelin | NFT management, marketplace, royalty distribution |
| **Frontend** | Next.js 15.4 + TypeScript + App Router | Modern React application with server-side rendering |
| **3D Rendering** | React Three Fiber + Three.js + Drei | 3D model display and interaction |
| **Blockchain** | Wagmi v2 + Viem + ConnectKit | Wallet connection and contract interactions |
| **State Management** | Zustand + TanStack Query v5 | Application state and server data management |
| **Styling** | TailwindCSS 4 + shadcn/ui + Radix UI | Component library and design system |
| **Storage** | IPFS + Pinata | Decentralized file storage |
| **Deployment** | Vercel + GitHub Actions | Automated deployment and CI/CD |

### System Architecture

```
User Input → Meshy AI API → 3D Model Generation → IPFS Storage → Smart Contract Minting → Frontend Display → Trading/Download
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- Foundry toolchain
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/GEN-3D-ASSETS.git
cd GEN-3D-ASSETS

# Install dependencies
pnpm install

# Install Foundry (macOS/Linux)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Environment Setup

```bash
# Copy environment templates
cp web/.env.example web/.env.local
cp contracts/.env.example contracts/.env

# Configure environment variables
# web/.env.local
MESHY_API_KEY=your_meshy_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET=your_pinata_secret

# contracts/.env
PRIVATE_KEY=your_wallet_private_key
RPC_URL=your_rpc_url
```

### Development

```bash
# Compile smart contracts
pnpm run build:contracts

# Start development server
pnpm run dev

# Run tests
pnpm run test
pnpm run test:contracts
```

Visit `http://localhost:3000` to view the application.

## 📁 Project Structure

```
GEN-3D-ASSETS/
├── contracts/                    # Foundry smart contract project
│   ├── src/
│   │   ├── Asset3DNFT.sol       # Main NFT contract with ERC-721 + extensions
│   │   ├── interfaces/          # Contract interfaces
│   │   └── libraries/           # Shared libraries
│   ├── test/                    # Contract tests
│   ├── script/                  # Deployment scripts
│   └── foundry.toml            # Foundry configuration
├── web/                         # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── generate/       # 3D asset generation
│   │   │   ├── marketplace/    # NFT marketplace
│   │   │   ├── nft/           # NFT management
│   │   │   └── profile/       # User profile
│   │   ├── components/
│   │   │   ├── 3d/            # 3D visualization components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── web3/          # Blockchain integration
│   │   │   └── layout/        # Layout components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and configurations
│   │   └── store/             # State management
│   └── package.json
├── docs/                        # Project documentation
├── .github/                     # GitHub Actions workflows
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── README.md
```

## 🎮 Usage Guide

### 1. Connect Wallet
Click "Connect Wallet" on the homepage. Supports MetaMask, WalletConnect, and other popular wallets via ConnectKit.

### 2. Generate 3D Assets
- Navigate to the "Generate" page
- Enter descriptive prompts (e.g., "A futuristic blue dragon")
- Wait for AI to generate the 3D model
- Preview and confirm the model quality

### 3. Mint NFT
- Select your preferred 3D model
- Set asset information (name, description, royalty percentage)
- Pay gas fees to complete on-chain minting
- Receive unique NFT ownership

### 4. View and Trade
- Browse all 3D assets in the "Gallery"
- View detailed 3D model information
- Trade NFTs in the "Marketplace"
- Download owned 3D model files

## 🔧 Development Scripts

```bash
# Development
pnpm run dev                     # Start frontend development server
pnpm run dev --filter web       # Start web app only

# Building
pnpm run build                   # Build all projects
pnpm run build:contracts        # Compile smart contracts

# Testing
pnpm run test                    # Run all tests
pnpm run test:contracts         # Run contract tests

# Code Quality
pnpm run lint                    # ESLint checking
pnpm run format                  # Code formatting
pnpm run lint:staged           # Pre-commit checks

# Deployment
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

## 📜 Smart Contracts

### Asset3DNFT.sol Features

#### Core NFT Functionality (ERC-721)
- ✅ NFT minting and management
- ✅ Metadata storage with IPFS integration
- ✅ Royalty mechanism (EIP-2981)
- ✅ Access control with role-based permissions
- ✅ Batch minting support

#### Advanced Features
- ✅ Asset upgrade system (preview → refine mode)
- ✅ Texture URL management
- ✅ Creator asset tracking
- ✅ Meshy task ID integration
- ✅ Pausable contract for emergency control

#### Security Features
- ✅ ReentrancyGuard protection
- ✅ Role-based access control
- ✅ Input validation and metadata verification
- ✅ Emergency pause functionality

## 🔐 Security Considerations

- ✅ API key server-side protection
- ✅ Input validation and file verification
- ✅ Reentrancy attack prevention
- ✅ Access control and permission management
- ✅ Rate limiting and usage controls
- ✅ Secure IPFS integration with Pinata

## 📊 Performance Optimizations

- ✅ 3D model Level of Detail (LOD)
- ✅ Lazy loading and preload strategies
- ✅ IPFS CDN acceleration with Pinata
- ✅ Next.js image and asset optimization
- ✅ Smart caching strategies with TanStack Query
- ✅ Progressive Web App (PWA) support

## 🛣️ Roadmap

### v1.0 - MVP ✅
- [x] Technology selection and architecture design
- [x] Smart contract development (Asset3DNFT)
- [x] Basic 3D generation and display
- [x] NFT minting functionality
- [x] Simple marketplace interface

### v1.1 - Enhanced Features 🚧
- [ ] Batch generation and minting
- [ ] Advanced search and filtering
- [ ] Mobile optimization
- [ ] Multi-language support

### v2.0 - Platform Expansion 📋
- [ ] Public API platform
- [ ] Plugin ecosystem
- [ ] Layer 2 integration
- [ ] Cross-chain support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Related Links

- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [API Documentation](./API_SPECIFICATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)

## 📞 Support

- 📧 Email: support@gen3dassets.com
- 💬 Discord: [Join our community](https://discord.gg/gen3dassets)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/GEN-3D-ASSETS/issues)

---

⭐ If this project helps you, please give us a Star!

**Made with ❤️ by the GEN-3D-ASSETS team**