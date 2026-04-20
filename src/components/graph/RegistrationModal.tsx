"use client";
import { useState } from 'react';

type Props = {
  isOpen: boolean;
  word: string;
  onClose: () => void;
  // onConfirm を Promise を返すようにして、結果を受け取れるようにするぞ
  onConfirm: (word: string) => Promise<{ success: boolean; isVirtual?: boolean; message?: string }>;
};

export const RegistrationModal = ({ isOpen, word, onClose, onConfirm }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorResult, setErrorResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const isValid = /^[a-zA-Z]+$/.test(word);

  const handleConfirm = async () => {
    setIsGenerating(true);
    setErrorResult(null);
    try {
      const result = await onConfirm(word);
      if (!result.success && result.isVirtual) {
        // ★ ここで Scale 4 （実在しない）のメッセージをセットする
        setErrorResult(result.message || "この宇宙には存在しない言葉のようです。");
      }
    } catch (e) {
      setErrorResult("宇宙の創造中にエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#1e1b4b] border border-white/20 p-8 rounded-3xl shadow-2xl w-[400px] flex flex-col items-center text-center">
        
        {/* アイコンの動的な切り替え */}
        <div className="text-4xl mb-4 text-purple-400">
          {isGenerating ? <span className="animate-spin inline-block">🌀</span> : errorResult ? "🚫" : "✨"}
        </div>

        <h3 className="text-white text-2xl font-black mb-2">
          {isGenerating ? "解析中..." : errorResult ? "観測失敗" : "未観測の領域"}
        </h3>
        
        <div className="text-white/70 mb-6 leading-relaxed">
          {errorResult ? (
            <p className="text-red-400 font-bold">{errorResult}</p>
          ) : !isValid ? (
            <p className="text-red-400 font-bold">アルファベットのみで入力してください。</p>
          ) : (
            <p>「<span className="text-white font-bold">{word}</span>」を新星として誕生させますか？</p>
          )}
        </div>
        
        <div className="flex gap-4 w-full">
          {!isGenerating && (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all font-bold"
            >
              {errorResult ? "閉じる" : "やめる"}
            </button>
          )}
          
          {isValid && !errorResult && (
            <button
              onClick={handleConfirm}
              disabled={isGenerating}
              className={`flex-1 rounded-full font-black shadow-lg transition-all active:scale-95 ${
                isGenerating 
                  ? "bg-gray-700 text-white/30 cursor-wait" 
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              }`}
            >
              {isGenerating ? "創造中..." : "観測する"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};