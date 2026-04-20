import { useState, useEffect } from 'react';
import { getSpiralCoords } from '@/lib/spiralLogic'; // さっき作った道具
import { GraphData, Node, Link } from '@/types/graph';

export const useUniverse = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 論理の修正：データを取得する処理を関数として独立させる ---
// useUniverse.ts 内

  const fetchUniverse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/elements');
      const rawContent: GraphData = await res.json();
      
      // ★ 戻り値が { nodes, links } のオブジェクトになったので、そのまま setData する
      const positionedUniverse = calculateUniverseCoords(rawContent.nodes, rawContent.links);
      setData(positionedUniverse); 
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchUniverse();
  }, []);

  // --- fetchUniverse を外から呼べるように公開する ---
  return { data, loading, refresh: fetchUniverse };
};

/**
 * 【論理の核心】全ノードの座標を計算する関数
 */
function calculateUniverseCoords(originalNodes: Node[], originalLinks: Link[]): { nodes: Node[], links: Link[] } {
  const CENTER_X = 2000;
  const CENTER_Y = 2000;
  
  const virtualNodes: Node[] = [];
  const virtualLinks: Link[] = [];

  // --- 1. 恒星 (Scale 1) ---
  const starNodes = originalNodes.filter(n => n.scale === 1);
  starNodes.forEach((star, i) => {
    const spiral = getSpiralCoords(i);
    virtualNodes.push({
      ...star,
      originalId: star.id, // ★ DB検索用に元のIDを保持
      x: CENTER_X + spiral.x,
      y: CENTER_Y + spiral.y
    });
  });

  // --- 2. 惑星 (Scale 2) ---
  originalNodes.filter(n => n.scale === 2).forEach(node => {
    const parentLinks = originalLinks.filter(l => (typeof l.target === 'object' ? l.target.id : l.target) === node.id);

    parentLinks.forEach(link => {
      const parentId = typeof link.source === 'object' ? link.source.id : link.source;
      const parentNode = virtualNodes.find(v => v.originalId === parentId && v.scale === 1);
      if (!parentNode || typeof parentNode.x !== 'number' || typeof parentNode.y !== 'number') return;

      // 等分割の計算（同じ親に繋がっているリンクの総数で割る）
      const siblings = originalLinks.filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === parentId);
      const index = siblings.findIndex(l => (typeof l.target === 'object' ? l.target.id : l.target) === node.id);
      
      const angle = (index / (siblings.length || 1)) * 2 * Math.PI;
      const RADIUS = 300;
      const vId = `${node.id}_from_${parentId}`;

      const vNode = {
        ...node,
        id: vId,
        originalId: node.id, // ★ 惑星も元のIDを保持
        x: parentNode.x + RADIUS * Math.cos(angle),
        y: parentNode.y + RADIUS * Math.sin(angle)
      };
      virtualNodes.push(vNode);

      // ★ リンクも新IDで作り直す！
      virtualLinks.push({ source: parentNode.id, target: vId });
    });
  });

  // --- 3. 衛星 (Scale 3) ---
  originalNodes.filter(n => n.scale === 3).forEach(node => {
    const parentLinks = originalLinks.filter(l => (typeof l.target === 'object' ? l.target.id : l.target) === node.id);

    parentLinks.forEach(link => {
      const originalParentId = typeof link.source === 'object' ? link.source.id : link.source;
      const parentInstances = virtualNodes.filter(v => v.originalId === originalParentId && v.scale === 2);

      parentInstances.forEach(pInst => {
        if (typeof pInst.x !== 'number' || typeof pInst.y !== 'number') return; 
        const siblings = originalLinks.filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === originalParentId);
        const index = siblings.findIndex(l => (typeof l.target === 'object' ? l.target.id : l.target) === node.id);
        
        const angle = (index / (siblings.length || 1)) * 2 * Math.PI;
        const MOON_RADIUS = 80;
        const vId = `${node.id}_at_${pInst.id}`;

        virtualNodes.push({
          ...node,
          id: vId,
          originalId: node.id, // ★ 衛星も元のIDを保持
          x: pInst.x + MOON_RADIUS * Math.cos(angle),
          y: pInst.y + MOON_RADIUS * Math.sin(angle)
        });

        // ★ リンク再接続
        virtualLinks.push({ source: pInst.id, target: vId });
      });
    });
  });

  return { nodes: virtualNodes, links: virtualLinks };
}