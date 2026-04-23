"use client";//ブラウザ側で動かすときの合図

import React, { useState, useEffect } from 'react';
import { useUniverse } from '@/hooks/useUniverse';
import { useCamera } from '@/hooks/useCamera';
import { BackgroundShapes } from './BackgroundShapes';
import { Orbit } from './Orbit';
import { CelestialBody } from './CelestialBody';
import { Node as UniverseNode, GraphData } from '@/types/graph';
import { SearchBar } from '@/components/graph/SearchBar';
import { RegistrationModal } from '@/components/graph/RegistrationModal';

export default function StaticUniverse() {//page.tsxから呼ばれて実行
  const { data, loading, refresh } = useUniverse();//useUniverseに行く
  const CENTER = 2000;

  const { 
    viewX, viewY, zoom, currentWidth, currentHeight,
    startDragging, moveCamera, stopDragging, handleWheel, isDragging, zoomIn, zoomOut, jumpTo
  } = useCamera(CENTER - 1500, CENTER - 1000, 3000, 2000);
  //検索

  // モーダルの表示フラグ
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 検索された（これから登録する）単語
  const [pendingWord, setPendingWord] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = (name: string) => {
    if (!data) return;
    const target = data.nodes.find(n => n.name.toLowerCase() === name.toLowerCase());

    if (target && typeof target.x === 'number' && typeof target.y === 'number') {
      jumpTo(target.x, target.y);
    } else {
      // 見つからなかったら、単語を保存してモーダルを開く
      setPendingWord(name);
      setIsModalOpen(true);
    }
  };
  const handleNodeClick = (node: UniverseNode) => {
    // node.id は仮想ID (uuid_from_...) 
    // node.originalId は本名 (uuid)
    const dbId = node.originalId || node.id;
    
    console.log(`アクセス開始: ${dbId}`);
    setSelectedId(dbId); // DBから情報を取るためのIDをセット
  };

  const [isGenerating, setIsGenerating] = useState(false);

const handleConfirmRegistration = async (word: string): Promise<{ success: boolean; uuid?: string; isVirtual?: boolean; message?: string }> => {
    setIsGenerating(true); // 観測（生成）開始！

    try {
      const response = await fetch('/api/generate-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      const resData = await response.json();
      console.log("--- DEBUG: API Response Body ---");
      console.log(JSON.stringify(resData, null, 2));

      if (resData.isVirtual) {
        // ★ 幻の星（Scale 4）だった場合
        // 成功ではないが、エラーでもないので success: false でメッセージを返す
        return { success: false, isVirtual: true, message: resData.message };
      }

      if (!response.ok) {
        const errorData = await response.json(); // サーバーが返したエラー詳細を読む
        throw new Error(`星の生成に失敗しました: ${errorData.error || '不明なエラー'}`);
      }

      const newUuid = resData.id || resData.uuid;

      // 1. 最新の宇宙データを取得し、再計算（螺旋や軌道の配置を更新）
      await refresh(); 

      // 2. jumpTo するために、一瞬だけ再レンダリングを待つ必要がある
      //（refresh直後はまだ data が古い場合があるため、少し猶予を持たせるのが論理的だ）
      setTimeout(() => {
        // refresh後の最新の data からターゲットを探す
        // ここでの data は refresh() によって更新された後のものだ
        const newStar = data?.nodes.find(n => n.name.toLowerCase() === word.toLowerCase());
        
        if (newStar && typeof newStar.x === 'number' && typeof newStar.y === 'number') {
          jumpTo(newStar.x, newStar.y);
          console.log(`新星「${word}」への跳躍に成功したぞ！`);
        }
      }, 100);

      return { success: true, uuid: newUuid, isVirtual: resData.isVirtual, message: resData.message };

    } catch (error) {
      console.error(error);
      return { 
        success: false, 
        message: "宇宙の調和が乱れ、生成に失敗した。" 
      };
    } finally {
      setIsGenerating(false); // 状態を戻す
    }
  };

  const [stableView, setStableView] = useState({ 
    x: CENTER - 1500, y: CENTER - 1000, w: 3000, h: 2000 
  });

  useEffect(() => {
    if (!isDragging) {
      setStableView({ x: viewX, y: viewY, w: currentWidth, h: currentHeight });
    }
  }, [isDragging, viewX, viewY, currentWidth, currentHeight]);

  if (loading || !data) return <div className="...">宇宙を再構築中...</div>;

  return (
    <div 
      className={`w-full h-screen overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ backgroundColor: '#8e83c4' }}
    >
      <SearchBar onSearch={handleSearch} />

      <RegistrationModal 
        isOpen={isModalOpen}
        word={pendingWord}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRegistration} // ★ここが handleConfirmRegistration になっているか？
      />
      {isGenerating && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="text-center">
            <div className="text-6xl animate-spin mb-4">🌀</div>
            <p className="text-white text-xl font-black tracking-widest">
              新星「{pendingWord}」を観測中...<br/>
              宇宙を拡張しています
            </p>
          </div>
        </div>
      )}

      <svg 
        viewBox={`${viewX} ${viewY} ${currentWidth} ${currentHeight}`} 
        className="w-full h-full touch-none"
        onPointerDown={startDragging}
        onPointerMove={moveCamera}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        onWheel={handleWheel}
      >
        
        {/* 1. 最背面：背景の図形 */}
        <BackgroundShapes 
          viewX={stableView.x} 
          viewY={stableView.y} 
          width={stableView.w} 
          height={stableView.h}
          isDragging={isDragging} 
        />

        // ... (他のインポートはそのまま)

        {/* 2. 中面：軌道（Orbit）の描画 */}
        <g id="orbits-layer">
          {data.links.map((link, index) => {
            const sourceNode = typeof link.source === 'string' 
              ? data.nodes.find(n => n.id === link.source) 
              : (link.source as UniverseNode);

            const targetNode = typeof link.target === 'string' 
              ? data.nodes.find(n => n.id === link.target) 
              : (link.target as UniverseNode);

            // ★ 論理の核心: ここで targetNode と sourceNode が「存在する」ことを確定させる
            if (!sourceNode || !targetNode) return null;

            const sourceX = sourceNode.x;
            const sourceY = sourceNode.y;
            const targetX = targetNode.x;
            const targetY = targetNode.y;

            // すべての座標が数値であることをチェック
            if (
              typeof sourceX === 'number' && typeof sourceY === 'number' &&
              typeof targetX === 'number' && typeof targetY === 'number'
            ) {
              const r = Math.sqrt(
                Math.pow(targetX - sourceX, 2) + 
                Math.pow(targetY - sourceY, 2)
              );

              if (!isNaN(r)) {
                return (
                  <Orbit
                    key={`orbit-${index}`}
                    cx={sourceX}
                    cy={sourceY}
                    r={r}
                    // ここで ?. を使えば、TypeScriptも「存在確認済み」と認めてくれる
                    type={targetNode?.scale === 3 ? 'moon' : 'planet'}
                  />
                );
              }
            }
            return null;
          })}
        </g>

        {/* 3. 前面：星本体（CelestialBody）の描画 */}
        <g id="celestial-bodies-layer">
          {data.nodes.map((node) => (
            <CelestialBody key={node.id} node={node} onClick={() => handleNodeClick(node)}/>
          ))}
        </g>
      </svg>
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        <button 
          onClick={zoomIn}
          className="w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white text-2xl font-bold flex items-center justify-center transition-all active:scale-90"
        >
          ＋
        </button>
        <button 
          onClick={zoomOut}
          className="w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white text-2xl font-bold flex items-center justify-center transition-all active:scale-90"
        >
          －
        </button>
      </div>
    </div>
  );
}