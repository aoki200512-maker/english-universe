import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponse } from "@/types/word";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateWordGraph(word: string): Promise<AIResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: `【思考プロセス】

入力された単語の「核（コア）」となる物理的な動きやイメージを抽出する。

その単語を構成する直近の親要素（語源、または基本単語）を特定する。

単語の重要度に基づき、Scale（1〜4）を厳格に判定する。

【Scaleの厳格な定義】

1 (Root): 語源そのもの。単体では単語として機能しない最小単位なども（例: trans, port）。

2 (Base): 語源が結合してできた、最もシンプルで一般的な単語（例: transport）。

3 (Derivative): 基本語から派生した、より具体的・複雑な単語（例: transportation）。

4 (Niche/Complex): 専門用語や、非常に限定的な文脈で使われる派生語。

出力フォーマット（JSON Schema）
{
  "word_data": {
    "name": "string (単語名/パーツ名)",
    "meaning_ja": "string (日本語の主な意味。複数は読点「、」で繋ぐ)",
    "core_image": "string (その単語の根底にある物理的な動きや概念。30文字程度の文章で記述)",
    "pos": ["string (品詞: root, noun, verb, adj, adv)"],
    "scale": "number (1|2|3|4)",
    "examples": [
      {
        "pos": "string (その例文で使われている品詞)",
        "en": "string (英語例文)",
        "ja": "string (和訳)"
      }
    ]
  },
  "parent_names": ["string (分解した際の直近の親パーツ名。Scale 1の場合は空配列)"]
}

解説禁止: JSON以外の文字（「はい、お答えします」等）は一切出力してはならない。

嘘の禁止: 語源が不明確な場合は、無理にこじつけず、一般的な語源説に基づき分解すること。

一言訳の徹底: meaning_ja はダラダラ書かず、最も本質的な意味を優先すること。

「イメージの言語化」: 訳語の丸暗記を防ぐため、core_image は必ず「物理的な動き」や「根底の概念」を説明する文章にすること。

「接辞の無視」: -tion, -able, -ly などの文法的な接辞は parent_names に含めないこと。意味の核となる語源、または基本単語のみを親とせよ。

全品詞網羅: その単語が持つ主要な品詞すべて（noun, verb, adj, adv）を pos 配列に含め、それに対応する意味を meaning_ja に記述せよ。（例: port は noun と verb の両方を含める）

もし存在しない単語だった場合はScale4にすること。


例
1. 語源 / パーツ (Scale 1)
入力: port
特徴: 最小単位。親はいない。多義的な品詞（名詞・動詞）を網羅。語源でなくても最小単位ならこれにする。


{
  "word_data": {
    "name": "port",
    "meaning_ja": "港、接続口、移植する、担ぐ",
    "core_image": "物理的に物を持ち上げ、ある地点から別の地点へ移動させるための「窓口」や「動作」",
    "pos": ["root", "noun", "verb"],
    "scale": 1,
    "examples": [
      {
        "pos": "noun",
        "en": "The ship is docking at the port.",
        "ja": "その船は港にドッキングしている。"
      },
      {
        "pos": "verb",
        "en": "They will port the app to Linux.",
        "ja": "彼らはそのアプリをリナックスに移植する予定だ。"
      }
    ]
  },
  "parent_names": []
}

入力: spect
特徴: 最小単位。単体では使うことが出来ない。

{
  "word_data": {
    "name": "spect",
    "meaning_ja": "見る、注視する",
    "core_image": "ある方向をじっと見つめる、または注意深く視線を向けるという物理的な動作",
    "pos": ["root"],
    "scale": 1,
    "examples": []
  },
  "parent_names": []
}


2. 基本語 (Scale 2)
入力: transport
特徴: 語源が合体したもの。親（trans と port）を抽出。名詞と動詞の例文を分ける。


{
  "word_data": {
    "name": "transport",
    "meaning_ja": "輸送する、運ぶ、輸送機関",
    "core_image": "境界や距離を越えて（trans）、向こう側へと物を運び動かす（port）こと",
    "pos": ["verb", "noun"],
    "scale": 2,
    "examples": [
      {
        "pos": "verb",
        "en": "Trucks transport goods across the border.",
        "ja": "トラックが国境を越えて商品を輸送します。"
      },
      {
        "pos": "noun",
        "en": "Air transport is faster than sea transport.",
        "ja": "航空輸送は海上輸送よりも速い。"
      }
    ]
  },
  "parent_names": ["trans", "port"]
}
3. 派生語 (Scale 3)
入力: transportation
特徴: 接辞（-tion）を無視し、親は transport のみに絞る。概念的なイメージ。


{
  "word_data": {
    "name": "transportation",
    "meaning_ja": "交通機関、輸送手段、運送",
    "core_image": "物を運ぶという一連の動作がシステム化され、社会のインフラとして機能している状態",
    "pos": ["noun"],
    "scale": 3,
    "examples": [
      {
        "pos": "noun",
        "en": "Is there any public transportation nearby?",
        "ja": "近くに公共交通機関はありますか？"
      }
    ]
  },
  "parent_names": ["transport"]
}
`,
  });

  const result = await model.generateContent(word);
  const rawText = result.response.text();
  
  // 防衛的プログラミング：JSON部分を抽出
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI応答にJSONが含まれていません");
  
  return JSON.parse(jsonMatch[0]) as AIResponse;
}