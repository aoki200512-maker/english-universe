// 1. ノード（星）の定義
export interface Node {
  id: string;
  name: string;
  meaning_ja?: string;
  scale: number; // 1:Root, 2:Base, 3:Moon...
  pos?: any;
  examples?: any;
  val?: number;
  x?: number; // 座標（計算後に注入する）
  y?: number; // 座標（計算後に注入する）
  originalId?: string;
}

// 2. リンク（繋がり）の定義
export interface Link {
  source: string | Node; // ID文字列、または展開されたNodeオブジェクト
  target: string | Node;
}

// 3. グラフ全体の定義
export interface GraphData {
  nodes: Node[];
  links: Link[];
}