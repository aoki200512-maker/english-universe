/**
 * 軌道を描画するコンポーネント
 * @param cx 中心X座標
 * @param cy 中心Y座標
 * @param r 半径
 * @param type 'planet'（惑星用：大きく太い）か 'moon'（衛星用：小さく細い）
 */
type OrbitProps = {
  cx: number;
  cy: number;
  r: number;
  type: 'planet' | 'moon';
};

export const Orbit = ({ cx, cy, r, type }: OrbitProps) => {
  // 論理的に見た目を切り替える
  const isPlanetOrbit = type === 'planet';
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      // 惑星の道は少し明るく、衛星の道は暗めにする
      stroke={isPlanetOrbit ? "#6fa0ee" : "#bed4f3"}
      strokeWidth={isPlanetOrbit ? 2 : 1}
      // 点線のパターン（[線の長さ, 空白の長さ]）
      strokeDasharray={isPlanetOrbit ? "10 5" : "4 4"}
    />
  );
};