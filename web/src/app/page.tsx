'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { THomepage } from '@/components/layout/THomepage';

export default function HomePage() {
  return (
    <LayoutWrapper defaultLayout="tStyle">
      <THomepage />
    </LayoutWrapper>
  );
}