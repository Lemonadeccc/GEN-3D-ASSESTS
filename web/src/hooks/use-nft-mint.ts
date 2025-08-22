'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, type Address } from 'viem';
import {
  ASSET3D_NFT_ABI,
  CONTRACT_ADDRESSES,
  type Asset3DMetadata,
} from '@/lib/contracts/asset3dnft';
import { createAndUploadNFTMetadata } from '@/lib/ipfs/client';
import { TaskStatusResponse } from '@/lib/meshy/types';
import { toast } from 'sonner';

export interface MintNFTParams {
  name: string;
  description: string;
  taskResult: TaskStatusResponse;
  royaltyBps?: number; // 版税基点 (例如: 500 = 5%)
}

export function useNFTMint() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const { address, chainId } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { 
    isLoading: isConfirming, 
    isSuccess: isTransactionSuccess,
    error: transactionError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // 重置状态函数
  const resetState = () => {
    setIsLoading(false);
    setCurrentStep('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  // 监听交易状态变化
  useEffect(() => {
    if (hash && isPending) {
      setCurrentStep('交易已提交，等待确认...');
      
      // 设置超时保护 (5分钟)
      const timeout = setTimeout(() => {
        if (isLoading) {
          resetState();
          toast.error('交易超时，请重试', {
            description: '如果交易已提交，请在Etherscan查看状态'
          });
        }
      }, 5 * 60 * 1000);
      
      setTimeoutId(timeout);
    }
  }, [hash, isPending, isLoading]);

  useEffect(() => {
    if (hash && isConfirming) {
      setCurrentStep('交易确认中，请稍候...');
    }
  }, [hash, isConfirming]);

  // 处理交易成功
  useEffect(() => {
    if (isTransactionSuccess && isLoading) {
      resetState();
      toast.success('NFT 铸造成功！', {
        description: '您的3D NFT已成功铸造到区块链',
      });
    }
  }, [isTransactionSuccess, isLoading]);

  // 处理交易错误
  useEffect(() => {
    if (error && isLoading) {
      console.error('Contract write error:', error);
      resetState();
      
      let errorMessage = '交易失败';
      if (error.message.includes('User rejected')) {
        errorMessage = '用户取消了交易';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '余额不足支付gas费用';
      } else if (error.message.includes('nonce')) {
        errorMessage = '交易序号错误，请重试';
      } else {
        errorMessage = `交易失败: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  }, [error, isLoading]);

  // 处理交易确认错误
  useEffect(() => {
    if (transactionError && isLoading) {
      console.error('Transaction confirmation error:', transactionError);
      resetState();
      toast.error(`交易确认失败: ${transactionError.message}`);
    }
  }, [transactionError, isLoading]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const mintNFT = async ({
    name,
    description,
    taskResult,
    royaltyBps = 250,
  }: MintNFTParams) => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }

    if (
      !chainId ||
      !CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    ) {
      toast.error('不支持的网络，请切换到Sepolia测试网');
      return;
    }

    setIsLoading(true);
    setCurrentStep('准备元数据...');

    try {
      // 1. 上传元数据到 IPFS
      setCurrentStep('上传元数据到 IPFS...');
      const metadataResult = await createAndUploadNFTMetadata(
        name,
        description,
        taskResult.thumbnail_url || taskResult.video_url || '',
        {
          taskId: taskResult.id,
          modelUrl:
            taskResult.model_urls?.glb || taskResult.model_urls?.obj || '',
          thumbnailUrl: taskResult.thumbnail_url,
          videoUrl: taskResult.video_url,
          textureUrls: taskResult.texture_urls?.map(tex => tex.base_color || '').filter(Boolean) || [],
          artStyle: taskResult.art_style || 'realistic',
          mode: taskResult.mode as 'preview' | 'refine',
          polycount: taskResult.polycount,
        }
      );

      toast.success('元数据上传成功！');

      // 2. 准备合约参数
      setCurrentStep('准备铸造参数...');
      const contractAddress = CONTRACT_ADDRESSES[
        chainId as keyof typeof CONTRACT_ADDRESSES
      ].ASSET3D_NFT as Address;

      const metadata: Asset3DMetadata = {
        name,
        description,
        meshyTaskId: taskResult.id,
        modelUrl: taskResult.model_urls?.glb || taskResult.model_urls?.obj || '',
        thumbnailUrl: taskResult.thumbnail_url || '',
        videoUrl: taskResult.video_url || '',
        textureUrls: taskResult.texture_urls?.map(tex => tex.base_color || '').filter(Boolean) || [],
        artStyle: taskResult.art_style || 'realistic',
        mode: taskResult.mode === 'refine' ? 1 : 0,
        hasTexture: (taskResult.texture_urls?.length || 0) > 0,
        polycount: BigInt(taskResult.polycount || 0),
        creator: address,
        royaltyBps: royaltyBps,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
      };

      // 3. 调用合约铸造
      setCurrentStep('发送交易到区块链...');
      console.log('Calling writeContract with:', {
        contractAddress,
        metadata,
        address
      });
      
      writeContract({
        address: contractAddress,
        abi: ASSET3D_NFT_ABI,
        functionName: 'mint',
        args: [address, metadata],
      });
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      setIsLoading(false);
      setCurrentStep('');
      
      let errorMessage = '铸造失败';
      if (error instanceof Error) {
        if (error.message.includes('Failed to create NFT metadata')) {
          errorMessage = '元数据创建失败，请检查IPFS配置';
        } else {
          errorMessage = `铸造失败: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return {
    mintNFT,
    resetState, // 暴露重置函数，允许手动重置
    isLoading: isLoading || isPending || isConfirming,
    currentStep: currentStep || (isPending ? '等待钱包确认...' : (isConfirming ? '交易确认中...' : '')),
    hash,
    isSuccess: isTransactionSuccess,
    error: error || transactionError,
  };
}
