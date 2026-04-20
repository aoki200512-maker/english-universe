// src/app/planet/[id]/layout.tsx
import { StaticBackground } from '@/components/StaticBackground';

export default function PlanetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 1. 背景：宇宙の星々（SVG） */}
      <div className="absolute inset-0 z-0">
        <StaticBackground />
      </div>

      {/* 2. 前景：惑星の詳細情報 */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}