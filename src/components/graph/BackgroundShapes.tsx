import React, { useMemo } from 'react';
import { generateBackgroundData, drawSakuraPath, drawPuffyDiamondPath, drawDotPath, drawStaticShootingStar } from './backgroundUtils';

interface BackgroundShapesProps {
  viewX: number;
  viewY: number;
  width: number;
  height: number;
  isDragging: boolean; // ドラッグ状態を受け取る
}

export const BackgroundShapes: React.FC<BackgroundShapesProps> = ({ viewX, viewY, width, height, isDragging }) => {
  
  // 【論理の核心】viewX, viewY などが変わったときだけ重い計算を実行
  const shapes = useMemo(() => {
    return generateBackgroundData(viewX, viewY, width, height);
  }, [viewX, viewY, width, height]);

  return (
    <g id="infinite-background">
      <defs>
        {/* ★1. 輪郭を丸くするベースフィルタ（Gooey） */}
        <filter id="gooey-base" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="gooey" />
        </filter>
        
        {/* ★2. 輪郭を丸くした後に、焦点ぼかし（レンズぼかし）をかける最終フィルタ */}
        <filter id="lens-blur" x="-50%" y="-50%" width="200%" height="200%">
          {/* まず、Gooeyフィルタの結果を取り込む */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          
          {/* Gooeyフィルタ済みのグラフィックに対して、
              レンズの焦点が合ってないような「柔らかいぼかし」をかける
              stdDeviation="4" を上げればもっとボケるぞ */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="final-blur" />
        </filter>
      </defs>

      {/* 2段階のフィルタを入れ子で適用する */}
      {/* まず角を丸くして(gooey-base)、その上からレンズぼかし(lens-blur)をかける */}
      <g 
        filter={isDragging ? "" : "url(#lens-blur)"} // 止まった時だけレンズぼかし
      >
        <g 
          filter="url(#gooey-base)" // 角丸は常に適用（軽量なので）
        >
        {shapes.map(s => {
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
              opacity={s.opacity} 
            />
          );
        })}
      </g>
    </g>
    </g>
  );
};