import { useState, useCallback, useRef, useEffect } from 'react';

export const useCamera = (initialX: number, initialY: number, baseWidth: number, baseHeight: number) => {
  const ZOOM_LEVELS = [2.0, 1.0, 0.5,0.2];
  const [camera, setCamera] = useState({ x: initialX, y: initialY, level: 1 });
  const [isDragging, setIsDragging] = useState(false);
  
  // ドラッグ開始時の「マウス直下のワールド座標」を保持する
  const dragStartWorldPos = useRef({ x: 0, y: 0 });

  // 1. スクロール禁止（windowに登録して確実に殺す）
  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => e.preventDefault();
    window.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleNativeWheel);
  }, []);

  // マウスのスクリーン座標をSVG内部のワールド座標に変換する共通関数
  const getWorldPoint = useCallback((svg: SVGSVGElement, clientX: number, clientY: number) => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const worldPoint = point.matrixTransform(ctm.inverse());
    return { x: worldPoint.x, y: worldPoint.y };
  }, []);

  // 2. ドラッグ開始
  const startDragging = useCallback((e: React.PointerEvent) => {
    const svg = e.currentTarget as SVGSVGElement;
    const pos = getWorldPoint(svg, e.clientX, e.clientY);
    
    setIsDragging(true);
    dragStartWorldPos.current = pos;
    // スリープ明けなどの不安定さを解消するため明示的にキャプチャ
    svg.setPointerCapture(e.pointerId);
  }, [getWorldPoint]);

  // 3. ドラッグ中（現在のマウス下の座標が、開始時の座標と一致するようにカメラを動かす）
  const moveCamera = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const svg = e.currentTarget as SVGSVGElement;
    
    setCamera(prev => {
      // 「今のマウス位置」が「ワールド座標のどこ」を指しているか
      const currentMouseWorldPos = getWorldPoint(svg, e.clientX, e.clientY);
      
      // 開始時との差分を計算
      const dx = currentMouseWorldPos.x - dragStartWorldPos.current.x;
      const dy = currentMouseWorldPos.y - dragStartWorldPos.current.y;

      return { ...prev, x: prev.x - dx, y: prev.y - dy };
    });
  }, [isDragging, getWorldPoint]);

  // 4. 4段階ズーム（完全に getScreenCTM に依存させる）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const svg = e.currentTarget as SVGSVGElement;
    const worldPos = getWorldPoint(svg, e.clientX, e.clientY);

    setCamera(prev => {
      const direction = e.deltaY > 0 ? -1 : 1;
      const nextLevel = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, prev.level + direction));
      if (nextLevel === prev.level) return prev;

      const newZoom = ZOOM_LEVELS[nextLevel];
      const rect = svg.getBoundingClientRect();

      // ★ 論理的修正：自前の比率計算を極力排除
      // ズーム後の左上座標 = 今のマウス下のワールド座標 - (マウスの相対位置 * 新しい表示幅)
      const nextX = worldPos.x - ((e.clientX - rect.left) * (baseWidth * newZoom)) / rect.width;
      const nextY = worldPos.y - ((e.clientY - rect.top) * (baseHeight * newZoom)) / rect.height;

      return { x: nextX, y: nextY, level: nextLevel };
    });
  }, [baseWidth, baseHeight, getWorldPoint]);

  const stopDragging = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    const svg = e.currentTarget as SVGSVGElement;
    if (svg.hasPointerCapture(e.pointerId)) {
      svg.releasePointerCapture(e.pointerId);
    }
  }, []);

  // 一段階ズームイン
  const zoomIn = useCallback(() => {
    setCamera(prev => {
      // 次のレベルへ（最大値を超えないように制限）
      const nextLevel = Math.min(ZOOM_LEVELS.length - 1, prev.level + 1);
      if (nextLevel === prev.level) return prev;

      const newZoom = ZOOM_LEVELS[nextLevel];
      const oldZoom = ZOOM_LEVELS[prev.level];

      // 【論理】画面中央を基準にするための計算
      // ズームで変化する分の「半分」だけ座標を動かすと、真ん中でズームしたように見える
      const dx = (baseWidth * oldZoom - baseWidth * newZoom) / 2;
      const dy = (baseHeight * oldZoom - baseHeight * newZoom) / 2;

      return { x: prev.x + dx, y: prev.y + dy, level: nextLevel };
    });
  }, [baseWidth, baseHeight]);

  // 一段階ズームアウト
  const zoomOut = useCallback(() => {
    setCamera(prev => {
      // 前のレベルへ（0未満にならないように制限）
      const nextLevel = Math.max(0, prev.level - 1);
      if (nextLevel === prev.level) return prev;

      const newZoom = ZOOM_LEVELS[nextLevel];
      const oldZoom = ZOOM_LEVELS[prev.level];

      const dx = (baseWidth * oldZoom - baseWidth * newZoom) / 2;
      const dy = (baseHeight * oldZoom - baseHeight * newZoom) / 2;

      return { x: prev.x + dx, y: prev.y + dy, level: nextLevel };
    });
  }, [baseWidth, baseHeight]);

  const jumpTo = useCallback((targetX: number, targetY: number) => {
    setCamera(prev => {
      // 1. 今のズームレベルでの画面サイズを取得
      const currentZoom = ZOOM_LEVELS[prev.level];
      const width = baseWidth * currentZoom;
      const height = baseHeight * currentZoom;

      // 2. ターゲット座標が「画面の真ん中」に来るような左上座標(x, y)を計算
      // 理屈：中心座標から、画面幅の半分を引けば左上の座標が出る
      const nextX = targetX - (width / 2);
      const nextY = targetY - (height / 2);

      return { ...prev, x: nextX, y: nextY };
    });
  }, [baseWidth, baseHeight]);

  // return の中身を更新
  return { 
    viewX: camera.x, 
    viewY: camera.y, 
    zoom: ZOOM_LEVELS[camera.level], 
    currentWidth: baseWidth * ZOOM_LEVELS[camera.level], 
    currentHeight: baseHeight * ZOOM_LEVELS[camera.level],
    startDragging, moveCamera, stopDragging, handleWheel, isDragging,
    zoomIn, zoomOut, // ★ これを外で使えるようにする
    jumpTo
  };
};