// src/app/[id]/page.tsx

import { fetchParentChain } from '@/lib/dbService';
import { ParentChain } from './_components/ParentChain';
import { supabase } from '@/lib/supabase';
import { GlassCircle } from './_components/GlassCircle';
import { WordHeader } from './_components/WordHeader';
import Link from 'next/link';

export default async function PlanetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. 現在の星のデータを取得
  const { data: planet } = await supabase.from('elements').select('*').eq('id', id).single();
  
  // 2. 親の繋がり（語源の家系図）を取得
  const parents = await fetchParentChain(id);

  if (!planet) return <div className="text-white p-10">Planet Not Found</div>;

  return (
    <main className="w-full h-screen text-white flex relative overflow-hidden font-sans bg-transparent">
      
      {/* 左側のナビゲーション */}
      {/* 左側のナビゲーション */}
<div className="flex-1 p-12 z-10">
  <Link 
    href="/" 
    className="
      /* インラインブロックにして、クリック範囲と質感を確保 */
      inline-flex items-center gap-2
      
      /* 文字をパキッとさせる：太字 & 純白 */
      text-white font-bold text-xl
      
      /* 背景に少し「ガラス感」を出す */
      bg-white/10 backdrop-blur-md 
      px-6 py-3 rounded-full
      
      /* 縁取り（右側のデザインと合わせる） */
      border border-white/20
      
      /* ホバー時の変化：少し浮き上がらせる */
      hover:bg-white/20 hover:border-white/40 
      hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
      transition-all duration-300
    "
  >
    {/* 矢印を少し太くしたり、アイコンっぽくするのもあり */}
    <span className="text-2xl">←</span> 
    <span>宇宙へ戻る</span>
  </Link>
</div>

      {/* ★左下：親要素のチェーンを追加 */}
      <ParentChain parents={parents} />

      {/* 右側の巨大な円と、その中身 */}
      <GlassCircle>
        <WordHeader 
          name={planet.name} 
          meaning={planet.meaning_ja}
          core_image={planet.core_image} 
          pos={planet.pos} 
          examples={planet.examples}
        />
      </GlassCircle>
    </main>
  );
}