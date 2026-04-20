/**
 * 渦巻き座標計算ロジック
 * * 引数 index: 0, 1, 2, ... (DBから届いた恒星の登録順)
 * 返り値: { x, y } (その星が位置すべき相対座標)
 */
export const getSpiralCoords = (index: number) => {
  // 0番目は中心 (0, 0)
  if (index === 0) return { x: 0, y: 0 };

  // 四角い渦巻き（グリッド・スパイラル）のアルゴリズム
  // ステップ数を元に、どの「層」にいるかを判定する
  let x = 0;
  let y = 0;
  let step = 0;
  let sideLength = 1;
  let direction = 0; // 0:右, 1:上, 2:左, 3:下

  for (let i = 0; i < index; i++) {
    switch (direction) {
      case 0: x++; break;
      case 1: y++; break;
      case 2: x--; break;
      case 3: y--; break;
    }

    step++;
    if (step === sideLength) {
      step = 0;
      // 2回曲がるたびに、直進できる距離（辺の長さ）が1増える
      if (direction === 1 || direction === 3) {
        sideLength++;
      }
      direction = (direction + 1) % 4;
    }
  }

  // 1単位を 1000px として、広大な宇宙の座標に変換する
  const GAP = 1000;
  return {
    x: x * GAP,
    y: y * GAP
  };
};