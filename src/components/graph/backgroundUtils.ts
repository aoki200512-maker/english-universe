// 決定論的な乱数
const seededRandom = (x: number, y: number, seed: number) => {
  const t = x * 15485863 + y * 20380747 + seed * 12345678;
  return (Math.abs(Math.sin(t)) * 10000) % 1;
};

// パス生成ロジック
export const drawPuffyDiamondPath = (size: number) => {
  const p = size / 2; const s = size * 0.15;
  return `M0,${-p} C${s},${-s} ${p},0 ${p},0 C${s},${s} 0,${p} 0,${p} C${-s},${s} ${-p},0 ${-p},0 C${-s},${-s} 0,${-p} 0,${-p} Z`;
};
export const drawDotPath = (size: number) => {
  const r = size / 2;
  return `M0,${-r} a${r},${r} 0 1,0 0,${size} a${r},${r} 0 1,0 0,${-size} Z`;
};
export const drawSakuraPath = (size: number) => {
  const r_out = size / 3; const r_in = r_out * 1.6;
  const degToRad = (deg: number) => deg * Math.PI / 180;
  const pts = Array.from({length: 10}).map((_, i) => {
    const r = i % 2 === 0 ? r_out : r_in;
    const a = degToRad(i * 36 - 90);
    return {x: r * Math.cos(a), y: r * Math.sin(a)};
  });
  let d = `M${pts[0].x},${pts[0].y}`;
  for(let i=0; i<5; i++) {
    const ti = pts[i*2 + 1]; const next_vi = pts[(i*2 + 2)%10];
    const cp0_r = r_in + (r_out - r_in) * 0.3;
    const cp0_a = degToRad(i * 72 + 18 - 90);
    const cp0 = {x: cp0_r * Math.cos(cp0_a), y: cp0_r * Math.sin(cp0_a)};
    const cp1_r = r_in + (r_out - r_in) * 0.3;
    const cp1_a = degToRad(i * 72 + 54 - 90);
    const cp1 = {x: cp1_r * Math.cos(cp1_a), y: cp1_r * Math.sin(cp1_a)};
    d += `Q${cp0.x},${cp0.y} ${ti.x},${ti.y} Q${cp1.x},${cp1.y} ${next_vi.x},${next_vi.y}`;
  }
  return d + 'Z';
};
export const drawStaticShootingStar = (width: number, height: number) => {
  const r = height / 2;
  return `M${r},0 h${width - 2*r} a${r},${r} 0 0 1 0,${height} h${-(width - 2*r)} a${r},${r} 0 0 1 0,${-height} Z`;
};

// データの配列を作るメイン関数
// データの配列を作るメイン関数
export const generateBackgroundData = (
  viewX: number, 
  viewY: number, 
  width: number, 
  height: number,
  density: number = 1 // ★ デフォルトは1（宇宙画面用）
) => {
  const TILE_SIZE = 1000;
  const startCol = Math.floor(viewX / TILE_SIZE);
  const endCol = Math.ceil((viewX + width) / TILE_SIZE);
  const startRow = Math.floor(viewY / TILE_SIZE);
  const endRow = Math.ceil((viewY + height) / TILE_SIZE);

  const shapes = [];
  for (let c = startCol; c <= endCol; c++) {
    for (let r = startRow; r <= endRow; r++) {
      // ★ ここを修正！ density を掛けることで、1タイルあたりの星の数を増やす
      // 元々が 2〜5個 だったので、density=3 なら 6〜15個 になる
      const baseCount = Math.floor(seededRandom(c, r, 7) * 4) + 2;
      const count = Math.floor(baseCount * density); 

      for (let i = 0; i < count; i++) {
        const typeIdx = Math.floor(seededRandom(c, r, i * 13) * 4);
        const type = (['diamond', 'dot', 'sakura', 'stream'] as const)[typeIdx];
        
        // ★ バイブス調整：増えた分、少し小さめの星（特にdot）が混ざるようにすると綺麗
        const baseSize = type === 'dot' ? 10 : type === 'sakura' ? 40 : type === 'stream' ? 100 : 50;
        
        shapes.push({
          id: `${c}-${r}-${i}`,
          type,
          x: c * TILE_SIZE + seededRandom(c, r, i * 23) * TILE_SIZE,
          y: r * TILE_SIZE + seededRandom(c, r, i * 29) * TILE_SIZE,
          size: baseSize * (0.8 + seededRandom(c, r, i * 31) * 0.5),
          rotation: type === 'stream' ? -40 : seededRandom(c, r, i * 37) * 360,
          // 星の色
          color: type === 'dot' ? "#eeeeee" : (seededRandom(c, r, i * 17) > 0.5 ? "#f8bbd0" : "#90caf9"),
          opacity: (0.6 + seededRandom(c, r, i * 41) * 0.4).toString(),
        });
      }
    }
  }
  return shapes;
};