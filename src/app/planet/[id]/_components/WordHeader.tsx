// src/app/[id]/_components/WordHeader.tsx

// ★型定義をアップデート：examples の中身に合わせて変更
type Props = {
  name: string;
  meaning: string;
  core_image: string;
  pos?: string[];
  examples?: any[]; // 本来は { en: string; ja: string }[] が望ましい
};

export const WordHeader = ({ name, meaning, core_image, pos, examples }: Props) => {
  // ★品詞を日本語に変換するマップ
  const posJa: Record<string, string> = {
    root: "語源",
    noun: "名詞",
    verb: "動詞",
    adj: "形容詞",
    adv: "副詞",
    preposition: "前置詞",
    conjunction: "接続詞",
    pronoun: "代名詞",
    interjection: "間投詞",
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1行目：単語名 */}
      <h1 className="text-8xl font-black tracking-tighter text-white">
        {name}
      </h1>

      {/* 4行目：品詞タグ（日本語化） */}
      <div className="flex gap-3 pl-2 mt-2">
        {pos?.map((p) => (
          <span key={p} className="
            px-4 py-1.5 
            bg-purple-500/40 rounded-full 
            text-purple-100 text-base font-bold 
            border border-purple-400/30
          ">
            {/* ★マップに無ければそのまま表示、あれば日本語を表示 */}
            {posJa[p.toLowerCase()] || p}
          </span>
        ))}
      </div>


      {/* 2行目：意味（一言で） */}
      <div className="pl-2 flex flex-col gap-1">
        <span className="text-purple-300 text-sm font-bold tracking-widest ml-1">一言で</span>
        <p className="text-5xl font-light text-slate-200">
          {meaning}
        </p>
      </div>

      {/* 3行目：核の意味 */}
      <div className="pl-2 flex flex-col gap-1">
        <span className="text-purple-300 text-sm font-bold tracking-widest ml-1">核の意味</span>
        <p className="text-5xl font-light text-slate-200">
          {core_image}
        </p>
      </div>



      {/* 区切り線 */}
      <div className="w-full h-[1px] bg-white/10 mt-4" />

      {/* 例文セクション */}
      {examples && examples.length > 0 && (
        <div className="flex flex-col gap-8 pl-4 border-l-2 border-purple-500/30 my-2">
          {examples.map((ex, index) => {
            return (
              <div key={index} className="flex flex-col gap-2">
                {/* 英語の例文 */}
                <p className="text-3xl font-normal text-white italic leading-relaxed">
                  <span className="text-purple-400 mr-3 text-xl not-italic font-bold">EN</span>
                  {typeof ex === 'string' ? ex : ex.en}
                </p>
                
                {/* 日本語の訳 */}
                <p className="text-3xl font-normal text-white italic leading-relaxed">
                  <span className="text-purple-400 mr-3 text-xl not-italic font-bold">JP</span>
                  {typeof ex === 'string' ? "" : ex.ja}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};