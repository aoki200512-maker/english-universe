// src/lib/dbService.ts
import { supabase } from './supabase';
import { GraphData } from '@/types/graph';

export async function fetchFullGraphData(): Promise<GraphData> {
  // 1. 全ての「星（単語）」を取得（新しいカラム名に対応）
  const { data: elements, error: elError } = await supabase
    .from('elements')
    .select('id, name, meaning_ja, core_image, scale, pos, examples'); // カラムを全取得

  if (elError) {
    console.error("Supabase elements error:", elError);
    throw elError;
  }

  // 2. 全ての「繋がり（親子関係）」を取得
  const { data: connections, error: connError } = await supabase
    .from('connections')
    .select('parent_id, child_id');

  if (connError) {
    console.error("Supabase connections error:", connError);
    throw connError;
  }

  // 3. グラフ用のデータにマッピング（ここが重要！）nodesに詰め込んでる。
  const nodes = (elements || []).map((el) => ({
    id: el.id,
    name: el.name,
    meaning_ja: el.meaning_ja,
    core_image: el.core_image,
    scale: el.scale, // ★これが無いと StaticUniverse.tsx で 0 判定される
    pos: el.pos,     // 品詞（JSONB）
    examples: el.examples, // 例文（JSONB）
    // scale (1:Root, 2:Base...) に応じて星の重要度（val）を計算
    val: (5 - (el.scale || 4)) * 5, 
  }));

  const links = (connections || []).map((conn) => ({
    source: conn.parent_id,
    target: conn.child_id,
  }));

  // ターミナルでデータの中身を最終確認
  console.log(`--- API DATA READY: ${nodes.length} nodes, ${links.length} links ---`);

  return { nodes, links };
}


// src/lib/dbService.ts に追加

export async function fetchParentChain(childId: string): Promise<any[]> {
  // 1. connectionsテーブルから、この子(childId)を持つすべての親IDを引く
  // .single() を外し、複数の結果を許容する
  const { data: conns, error: connError } = await supabase
    .from('connections')
    .select('parent_id')
    .eq('child_id', childId);

  if (connError || !conns || conns.length === 0) return [];

  // 2. 取得した親IDの配列を作る
  const parentIds = conns.map(c => c.parent_id);

  // 3. elementsテーブルから、親たちの詳細情報を一気に取得する
  // .in() を使うことで、複数のIDをまとめて引ける
  const { data: parents, error: elemError } = await supabase
    .from('elements')
    .select('id, name, meaning_ja')
    .in('id', parentIds);

  if (elemError || !parents) return [];

  // 宇宙の表示順序と合わせたいなら、ここでソートなどを入れてもいい
  return parents; 
}