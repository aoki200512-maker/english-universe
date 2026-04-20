"use client"; 
import Link from 'next/link'; 
import { Node as UniverseNode } from '@/types/graph';

// ★ 修正1: 型定義に onClick を追加する
type CelestialBodyProps = {
  node: UniverseNode;
  onClick?: () => void; // 親(StaticUniverse)から渡される関数を受け取れるようにする
};

export const CelestialBody = ({ node, onClick }: CelestialBodyProps) => {
  const isRoot = node.scale === 1;

  const config = {
    radius: isRoot ? 150 : node.scale === 2 ? 50 : 25,
    color: isRoot ? "#85b4ff" : node.scale === 2 ? "#ff9fd8" : "#ffd3ec",
    fontSize: isRoot ? 45 : node.scale === 2 ? 20 : 10,
    strokeWidth: isRoot ? 4 : 2,
    fontWeight: "bold" as const,
  };

  if (node.x === undefined || node.y === undefined) return null;

  // ★ 論理の要: originalIdがあればそれを、なければidをDBアクセスに使う
  const dbId = node.originalId || node.id;

  return (
    <Link href={`/planet/${dbId}`} style={{ cursor: 'pointer' }}>
      <g 
        transform={`translate(${node.x}, ${node.y})`}
        className="group transition-transform"
        // ★ 修正2: クリック（ポインターダウン）時に親の関数を呼び出す
        onPointerDown={(e) => {
          e.stopPropagation(); // カメラのドラッグを邪魔しない
          onClick?.();         // handleNodeClick(node) を実行！
        }}
      >
        <circle
          r={config.radius}
          fill={config.color}
          stroke="#8e83c4"
          strokeWidth={config.strokeWidth}
          className="transition-all duration-300 group-hover:brightness-110 group-hover:stroke-white group-hover:stroke-[3px]"
        />
        
        <text
          y={0}
          dy=".35em" 
          textAnchor="middle"
          fill="#4a446a"
          fontSize={config.fontSize}
          fontWeight={config.fontWeight}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.name}
        </text>
      </g>
    </Link>
  );
};