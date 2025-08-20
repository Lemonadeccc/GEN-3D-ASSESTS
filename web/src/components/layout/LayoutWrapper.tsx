'use client';

import { useState, useEffect, ReactNode } from 'react';
import TLayout from './tLayout';
import { MainLayout } from './MainLayout';

interface LayoutWrapperProps {
  children: ReactNode;
  defaultLayout?: 'original' | 'tStyle';
}

export function LayoutWrapper({ children, defaultLayout = 'original' }: LayoutWrapperProps) {
  const [useNewLayout, setUseNewLayout] = useState(defaultLayout === 'tStyle');

  // 从 localStorage 恢复布局偏好
  useEffect(() => {
    const savedLayout = localStorage.getItem('layout-preference');
    if (savedLayout) {
      setUseNewLayout(savedLayout === 'tStyle');
    }
  }, []);

  // 保存布局偏好到 localStorage
  const toggleLayout = () => {
    const newLayoutState = !useNewLayout;
    setUseNewLayout(newLayoutState);
    localStorage.setItem('layout-preference', newLayoutState ? 'tStyle' : 'original');
  };

  if (useNewLayout) {
    return (
      <TLayout onToggleLayout={toggleLayout} showNavigation={true}>
        {children}
      </TLayout>
    );
  }

  return (
    <MainLayout onToggleLayout={toggleLayout}>
      {children}
    </MainLayout>
  );
}