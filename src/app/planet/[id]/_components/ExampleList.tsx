// src/app/[id]/_components/ExampleList.tsx
export const ExampleList = ({ examples }: { examples: any[] }) => {
  return (
    <div className="w-full max-h-[40vh] overflow-y-auto space-y-8 pr-6 custom-scrollbar">
      {examples?.map((ex, i) => (
        <div key={i} className="text-left border-l-4 border-blue-800/50 pl-6 group">
          <p className="text-xl italic text-white/90 group-hover:text-blue-100 transition-colors">
            "{ex.en}"
          </p>
          <p className="text-lg text-white/50 mt-1">{ex.ja}</p>
        </div>
      ))}
    </div>
  );
};