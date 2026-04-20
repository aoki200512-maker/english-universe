// types/word.ts
export interface WordData {
  name: string;
  meaning_ja: string;
  core_image: string;
  pos: string[];
  scale: 1 | 2 | 3 | 4;
  examples: {
    pos: string;
    en: string;
    ja: string;
  }[];
}

export interface AIResponse {
  word_data: WordData;
  parent_names: string[];
}