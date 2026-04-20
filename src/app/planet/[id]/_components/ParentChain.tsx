// src/app/[id]/_components/ParentChain.tsx
"use client";
import Link from 'next/link';

type ParentNode = {
  id: string;
  name: string;
  meaning_ja: string;
};

export const ParentChain = ({ parents }: { parents: ParentNode[] }) => {
  if (!parents || parents.length === 0) return null;

  return (
    <div className="absolute bottom-12 left-12 flex flex-col-reverse gap-4 z-20">
      {parents.map((parent, index) => (
        <Link href={`/planet/${parent.id}`} key={parent.id} className="group flex items-center gap-6">
          
          {/* 円：サイズ固定、視認性重視 */}
          <div 
            className="
              w-45 h-45              /* 大きさをしっかり確保 (128px) */
              flex flex-col items-center justify-center
              rounded-full 
              border-2 border-white/20 bg-[#2d1b4d]/60  /* 右側の円に合わせた濃い紫 */
              backdrop-blur-xl
              group-hover:border-white/60 group-hover:bg-[#3d2b5d] 
              transition-all duration-200
              shadow-xl
              p-4
            "
          >
            <p className="text-white font-black text-3xl text-center leading-tight">
              {parent.name}
            </p>
            <p className="text-white/60 text-[15px] text-center mt-1 truncate w-24">
              {parent.meaning_ja}
            </p>
          </div>

          {/* 右側のラベル：何代前か直感的に分からせる */}


        </Link>
      ))}
      
      {/* 案内：一番下に「語源の繋がり」というラベルを置くとかっこいい */}
    </div>
  );
};