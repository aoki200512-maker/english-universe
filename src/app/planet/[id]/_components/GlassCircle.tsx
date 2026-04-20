// src/app/[id]/_components/GlassCircle.tsx

export const GlassCircle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="
      absolute
      w-[85vw] h-[160vh] 
      -right-[10vw] top-1/2 -translate-y-1/2 
      rounded-full 
      
      /* ★背景の紫より「深く、濃い」紫にする。透明度を調整して重厚感を出す */
      bg-[#2d1b4d]/80
      backdrop-blur-3xl
      
      /* ★縁にだけ「細い光のライン」を入れることで、背景との境界を分からせる */
      border border-white/20
      
      /* ★影は白ではなく、青白い光にして「冷たく輝く天体」感を出す */
      shadow-[0_0_80px_rgba(100,100,255,0.1),_inset_0_0_50px_rgba(255,255,255,0.05)]
      
      flex items-center justify-start 
      p-24 pl-48 
      z-0
    ">
      <div className="w-[45vw] flex flex-col gap-12 text-white">
        {children}
      </div>
    </div>
  );
};