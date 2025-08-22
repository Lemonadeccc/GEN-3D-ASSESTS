'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { TMarketplacePage } from '@/components/marketplace';

export default function MarketplacePage() {
  return (
    <LayoutWrapper defaultLayout="tStyle">
      <TMarketplacePage />
    </LayoutWrapper>
  );
}