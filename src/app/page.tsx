// src/app/page.tsx
//まずここからスタート
import StaticUniverse from '@/components/graph/StaticUniverse';

export default function Home() {//ここがメイン関数
  return (
    // ここで背景色を指定し、余計な padding や title を削除する。つまり、高さや横を画面いっぱいにしてる
    <main className="w-full h-screen bg-[#020617] overflow-hidden m-0 p-0">
      <StaticUniverse />
    </main>
  );
}