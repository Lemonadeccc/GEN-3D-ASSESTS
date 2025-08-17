# API 接口规范

## 📋 接口概览

本文档定义了3D NFT平台所需的所有API接口，包括第三方服务集成和内部API设计。

### 接口分类
1. **Meshy AI API** - 3D模型生成服务
2. **IPFS API** - 去中心化存储服务  
3. **智能合约接口** - 区块链NFT操作
4. **内部API Routes** - Next.js API路由
5. **第三方集成** - 钱包、支付等服务

## 🤖 Meshy AI API 集成

### 1. 提交生成任务

```typescript
POST https://api.meshy.ai/v2/text-to-3d

interface GenerationRequest {
  prompt: string;
  art_style: 'realistic' | 'cartoon' | 'anime' | 'fantasy' | 'cyberpunk';
  quality: 'standard' | 'high' | 'ultra';
  negative_prompt?: string;
  seed?: number;
  output_format: 'glb' | 'fbx' | 'obj';
}

interface GenerationResponse {
  success: boolean;
  task_id: string;
  estimated_time: number; // 预估完成时间（秒）
  credits_used: number;
}
```

### 2. 查询任务状态

```typescript
GET https://api.meshy.ai/v2/text-to-3d/{task_id}

interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  created_at: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  result?: {
    model_urls: {
      glb: string;
      fbx?: string;
      obj?: string;
    };
    preview_url: string;
    thumbnail_url: string;
    model_info: {
      vertices: number;
      faces: number;
      file_size: number;
      dimensions: { x: number; y: number; z: number; };
    };
  };
}
```

### 3. 下载模型文件

```typescript
GET https://api.meshy.ai/v2/download/{file_id}

// 直接返回二进制文件数据
// Content-Type: application/octet-stream
// Content-Disposition: attachment; filename="model.glb"
```

### 4. Meshy AI SDK 封装

```typescript
// lib/meshy/client.ts
export class MeshyClient {
  private apiKey: string;
  private baseURL = 'https://api.meshy.ai/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: GenerationRequest): Promise<GenerationResponse> {
    const response = await fetch(`${this.baseURL}/text-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Meshy API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await fetch(`${this.baseURL}/text-to-3d/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadModel(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/download/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    return response.blob();
  }
}
```

## 📦 IPFS 存储 API

### 1. Pinata IPFS集成

```typescript
// lib/ipfs/pinata.ts
export class PinataClient {
  private apiKey: string;
  private secretKey: string;
  private baseURL = 'https://api.pinata.cloud';

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async uploadFile(file: File): Promise<IPFSUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: '3d-model',
        timestamp: Date.now().toString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch(`${this.baseURL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey,
      },
      body: formData,
    });

    return response.json();
  }

  async uploadJSON(json: object): Promise<IPFSUploadResponse> {
    const response = await fetch(`${this.baseURL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey,
      },
      body: JSON.stringify({
        pinataContent: json,
        pinataMetadata: {
          name: 'nft-metadata',
        },
      }),
    });

    return response.json();
  }
}

interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}
```

### 2. NFT元数据标准

```typescript
// types/nft.ts
interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL of preview image
  animation_url: string; // IPFS URL of 3D model
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
  }>;
  properties: {
    model_format: string; // 'glb', 'fbx', 'obj'
    file_size: number;
    vertices: number;
    faces: number;
    generation_prompt: string;
    art_style: string;
    created_at: string;
    creator: string; // wallet address
  };
  external_url?: string; // Link to platform page
}

// 示例NFT元数据
const exampleMetadata: NFTMetadata = {
  name: "Cyber Dragon #001",
  description: "A majestic cyberpunk dragon with glowing blue scales and mechanical wings, generated from AI prompt.",
  image: "ipfs://QmYourImageHash",
  animation_url: "ipfs://QmYour3DModelHash",
  attributes: [
    {
      trait_type: "Style",
      value: "Cyberpunk"
    },
    {
      trait_type: "Quality",
      value: "Ultra"
    },
    {
      trait_type: "Vertices",
      value: 15420,
      display_type: "number"
    },
    {
      trait_type: "Generation Date",
      value: 1692847200,
      display_type: "date"
    }
  ],
  properties: {
    model_format: "glb",
    file_size: 2048576,
    vertices: 15420,
    faces: 8710,
    generation_prompt: "A cyberpunk dragon with glowing blue scales",
    art_style: "cyberpunk",
    created_at: "2025-08-16T10:30:00Z",
    creator: "0x742d35Cc6634C0532925a3b8D1dBe7C4738c3e61"
  },
  external_url: "https://gen3d.app/asset/1"
};
```

## ⛓️ 智能合约接口

### 1. NFT合约 (ERC-721)

```solidity
// contracts/src/Gen3DNFT.sol
interface IGen3DNFT {
    // 铸造NFT
    function mint(
        address to,
        string memory tokenURI,
        uint256 price
    ) external payable returns (uint256 tokenId);

    // 批量铸造
    function batchMint(
        address to,
        string[] memory tokenURIs,
        uint256[] memory prices
    ) external payable returns (uint256[] memory tokenIds);

    // 设置royalty
    function setRoyalty(uint256 tokenId, uint96 feeNumerator) external;

    // 查询NFT信息
    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory);

    // 查询用户NFT
    function getUserTokens(address owner) external view returns (uint256[] memory);

    // 转售NFT
    function resell(uint256 tokenId, uint256 price) external;

    // 购买NFT
    function buyNFT(uint256 tokenId) external payable;
}

struct TokenInfo {
    string tokenURI;
    uint256 price;
    address creator;
    address currentOwner;
    uint256 createdAt;
    bool isForSale;
    uint256 royaltyFee;
}
```

### 2. 市场合约

```solidity
// contracts/src/Gen3DMarketplace.sol
interface IGen3DMarketplace {
    // 上架NFT
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external;

    // 下架NFT
    function cancelListing(address nftContract, uint256 tokenId) external;

    // 购买NFT
    function buyNFT(address nftContract, uint256 tokenId) external payable;

    // 出价
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 deadline
    ) external payable;

    // 接受出价
    function acceptOffer(address nftContract, uint256 tokenId, address buyer) external;

    // 查询市场列表
    function getActiveListings(uint256 offset, uint256 limit) 
        external view returns (Listing[] memory);

    // 查询NFT历史
    function getTokenHistory(address nftContract, uint256 tokenId)
        external view returns (Transaction[] memory);
}

struct Listing {
    address nftContract;
    uint256 tokenId;
    address seller;
    uint256 price;
    uint256 createdAt;
    bool isActive;
}

struct Transaction {
    address from;
    address to;
    uint256 price;
    uint256 timestamp;
    TransactionType txType;
}

enum TransactionType {
    Mint,
    Transfer,
    Sale,
    Offer
}
```

### 3. Web3 TypeScript接口

```typescript
// lib/web3/contracts.ts
import { Address, parseEther } from 'viem';

export class NFTContract {
  private contract: any; // viem contract instance
  
  constructor(address: Address, publicClient: any, walletClient: any) {
    // 初始化合约实例
  }

  async mint(
    to: Address,
    tokenURI: string,
    price: bigint
  ): Promise<{ hash: string; tokenId: bigint }> {
    const { request } = await this.contract.simulate.mint([to, tokenURI, price], {
      value: price,
    });
    
    const hash = await this.walletClient.writeContract(request);
    
    // 等待交易确认并获取tokenId
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const tokenId = this.parseTokenIdFromLogs(receipt.logs);
    
    return { hash, tokenId };
  }

  async getUserTokens(address: Address): Promise<TokenInfo[]> {
    const tokenIds = await this.contract.read.getUserTokens([address]);
    
    const tokens = await Promise.all(
      tokenIds.map(async (tokenId: bigint) => {
        return await this.contract.read.getTokenInfo([tokenId]);
      })
    );
    
    return tokens;
  }

  async getTokenURI(tokenId: bigint): Promise<string> {
    return await this.contract.read.tokenURI([tokenId]);
  }
}
```

## 🔗 Next.js API Routes

### 1. Meshy集成路由

```typescript
// app/api/meshy/generate/route.ts
export async function POST(request: Request) {
  try {
    const { prompt, settings } = await request.json();
    
    // 验证请求参数
    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: 'Prompt must be at least 3 characters' },
        { status: 400 }
      );
    }

    // 调用Meshy API
    const meshyClient = new MeshyClient(process.env.MESHY_API_KEY!);
    const result = await meshyClient.createTask({
      prompt,
      art_style: settings.artStyle || 'realistic',
      quality: settings.quality || 'standard',
      output_format: 'glb',
    });

    return NextResponse.json({
      success: true,
      taskId: result.task_id,
      estimatedTime: result.estimated_time,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/meshy/status/[taskId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const meshyClient = new MeshyClient(process.env.MESHY_API_KEY!);
    const status = await meshyClient.getTaskStatus(params.taskId);

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get task status' },
      { status: 500 }
    );
  }
}
```

### 2. IPFS上传路由

```typescript
// app/api/ipfs/upload/route.ts
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型和大小
    const allowedTypes = ['model/gltf-binary', 'application/octet-stream'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.glb')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only GLB files allowed.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // 上传到IPFS
    const pinataClient = new PinataClient(
      process.env.PINATA_API_KEY!,
      process.env.PINATA_SECRET_KEY!
    );
    
    const result = await pinataClient.uploadFile(file);

    return NextResponse.json({
      success: true,
      ipfsHash: result.IpfsHash,
      size: result.PinSize,
      url: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
}
```

### 3. NFT元数据路由

```typescript
// app/api/nft/metadata/route.ts
export async function POST(request: Request) {
  try {
    const metadata: NFTMetadata = await request.json();
    
    // 验证元数据格式
    if (!metadata.name || !metadata.description || !metadata.animation_url) {
      return NextResponse.json(
        { error: 'Missing required metadata fields' },
        { status: 400 }
      );
    }

    // 上传元数据到IPFS
    const pinataClient = new PinataClient(
      process.env.PINATA_API_KEY!,
      process.env.PINATA_SECRET_KEY!
    );
    
    const result = await pinataClient.uploadJSON(metadata);

    return NextResponse.json({
      success: true,
      metadataURI: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}
```

### 4. 智能合约交互路由

```typescript
// app/api/contracts/mint/route.ts
export async function POST(request: Request) {
  try {
    const { 
      walletAddress, 
      metadataURI, 
      price,
      signature // 可选：服务端验证签名
    } = await request.json();

    // 验证参数
    if (!walletAddress || !metadataURI) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 这里可以添加服务端业务逻辑
    // 例如：数据库记录、支付验证等

    // 返回前端需要的合约调用参数
    return NextResponse.json({
      success: true,
      contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
      mintPrice: price,
      gasEstimate: '0x5208', // 21000 in hex
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to prepare mint transaction' },
      { status: 500 }
    );
  }
}
```

## 🔐 认证和安全

### 1. API Key管理

```typescript
// lib/auth/api-keys.ts
export class APIKeyManager {
  static validateMeshyKey(key: string): boolean {
    return key.startsWith('msy_') && key.length === 64;
  }

  static validatePinataCredentials(apiKey: string, secretKey: string): boolean {
    return apiKey.length === 20 && secretKey.length === 64;
  }

  static rateLimitKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }
}
```

### 2. 请求限制中间件

```typescript
// lib/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 每分钟10次请求
});

export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    });
  }

  return handler();
}
```

## 📊 错误处理和监控

### 1. 统一错误响应格式

```typescript
// lib/api/error-handler.ts
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class APIErrorHandler {
  static createError(
    code: string,
    message: string,
    details?: any
  ): APIError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    };
  }

  static handleMeshyError(error: any): APIError {
    if (error.status === 429) {
      return this.createError(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests to Meshy AI. Please try again later.',
        { retryAfter: error.headers?.['retry-after'] }
      );
    }

    return this.createError(
      'MESHY_API_ERROR',
      'Failed to generate 3D model',
      error
    );
  }

  static handleWeb3Error(error: any): APIError {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return this.createError(
        'INSUFFICIENT_FUNDS',
        'Insufficient funds for transaction'
      );
    }

    return this.createError(
      'WEB3_ERROR',
      'Blockchain transaction failed',
      error
    );
  }
}
```

### 2. API监控

```typescript
// lib/monitoring/api-metrics.ts
export class APIMetrics {
  static async logRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ) {
    // 发送到监控服务 (Datadog, New Relic, 等)
    await fetch('/api/internal/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        method,
        statusCode,
        duration,
        timestamp: Date.now(),
      }),
    });
  }

  static async recordError(error: APIError, endpoint: string) {
    // 记录错误到日志服务
    console.error(`API Error on ${endpoint}:`, error);
  }
}
```

---

*接口版本: v1.0*  
*更新时间: 2025-08-16*