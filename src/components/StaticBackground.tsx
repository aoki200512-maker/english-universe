"use client";
import { 
  generateBackgroundData, 
  drawSakuraPath, 
  drawPuffyDiamondPath, 
  drawDotPath, 
  drawStaticShootingStar 
} from './graph/backgroundUtils'; // パスは環境に合わせて調整してな！

import React, { useMemo, useState, useEffect } from 'react';
// ... import類はそのまま

export const StaticBackground: React.FC = () => {
  const width = 3300;
  const height = 1500;

  // 1. マウント済みかどうかを管理するステート
  const [mounted, setMounted] = useState(false);

  // 2. useEffectはクライアントサイドでのみ実行される
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. データ生成自体は useMemo でいいが、実行タイミングを制御する
  const shapes = useMemo(() => {
    // サーバーサイド（mountedがfalseの間）では空配列を返して、不一致を防ぐ
    if (!mounted) return [];
    return generateBackgroundData(0, 0, width, height, 3);
  }, [mounted]); // mounted が true になった時に再計算される

  // 4. サーバーサイドとクライアントサイドの初期レンダリングを「空」で一致させる
  if (!mounted) {
    return (
      <svg 
        className="absolute inset-0 w-full h-full bg-[#8e83c4]"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
      />
    );
  }

  return (
    <svg 
      className="absolute inset-0 w-full h-full bg-[#8e83c4]"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="static-gooey" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
        </filter>
        <filter id="static-lens-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>

      <g filter="url(#static-lens-blur)">
        <g filter="url(#static-gooey)">
          {shapes.map((s) => {
            let d = "";
            if (s.type === 'sakura') d = drawSakuraPath(s.size);
            else if (s.type === 'diamond') d = drawPuffyDiamondPath(s.size);
            else if (s.type === 'dot') d = drawDotPath(s.size);
            else if (s.type === 'stream') d = drawStaticShootingStar(s.size, s.size * 0.15);

            return (
              <path 
                key={s.id} 
                d={d} 
                fill={s.color} 
                transform={`translate(${s.x}, ${s.y}) rotate(${s.rotation})`} 
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};