import { NextResponse } from 'next/server';
import { generateWordGraph } from '@/lib/aiService';
import { createClient } from '@supabase/supabase-js'; // あおきの環境に合わせて

// Supabaseの設定（環境変数は .env にある想定だ）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ★ 再帰処理は管理者権限でやるのが安全だ
);

async function processWordRecursively(wordName: string) {
  // 1. 既にDBにあるかチェック
  const { data: existing } = await supabase
    .from('elements')
    .select('id, scale') // scaleも取っておくと安全だ
    .eq('name', wordName)
    .single();

  if (existing) return existing.id;

  // 2. なければAIで生成
  console.log(`[宇宙拡張中] ${wordName} を解析しています...`);
  const aiData = await generateWordGraph(wordName);
  const { word_data, parent_names } = aiData;

  // ★ 修正ポイント：Scale 4 (存在しない単語) の即時排除
  if (word_data.scale === 4) {
    console.log(`[観測失敗] ${wordName} は存在しない単語（Scale 4）のため、記録を中止します。`);
    // DBには保存せず、nullや特別な値を返す
    return null; 
  }

  // 3. 親要素を先に解決する（再帰）
  // 親がScale 4だった場合、nullが返ってくるのでfilterで除外する
  const rawParentIds = await Promise.all(
    parent_names.map(name => processWordRecursively(name))
  );
  const parentIds = rawParentIds.filter(id => id !== null);

  // 4. 自分を保存（ここに来るのは Scale 4 以外の正常な単語のみ）
  const { data: newElement, error: elError } = await supabase
    .from('elements')
    .insert({
      name: word_data.name,
      meaning_ja: word_data.meaning_ja,
      core_image: word_data.core_image,
      pos: word_data.pos,
      examples: word_data.examples,
      scale: word_data.scale,
    })
    .select()
    .single();

  if (elError) throw elError;

  // 5. 繋がり（軌道）を保存
  if (parentIds.length > 0) {
    const connections = parentIds.map(pId => ({
      parent_id: pId,
      child_id: newElement.id
    }));
    
    const { error: connError } = await supabase.from('connections').insert(connections);
    if (connError) console.error("軌道の形成に失敗したぞ:", connError);
  }

  return newElement.id;
}

export async function POST(request: Request) {
  try {
    const { word } = await request.json();
    if (!word) return NextResponse.json({ error: '無の検索はできません' }, { status: 400 });
    if (!/^[a-zA-Z]+$/.test(word)) {
      return Response.json({ error: "Invalid input: Only English letters allowed." }, { status: 400 });
    }
    const finalId = await processWordRecursively(word);

    if (!finalId) {
      return NextResponse.json({ 
        success: false, 
        isVirtual: true, 
        message: "この単語は実在しないため、宇宙には刻まれませんでした。" 
      }, { status: 200 }); // エラーではなく「正常な拒絶」として返す
    }

    // 再帰生成スタート！
    await processWordRecursively(word);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('宇宙創造エラー:', error);
    return NextResponse.json({ error: 'ビッグバンに失敗しました' }, { status: 500 });
  }
}