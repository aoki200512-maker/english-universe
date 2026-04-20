// src/app/api/elements/route.ts
import { NextResponse } from 'next/server';
import { fetchFullGraphData } from '@/lib/dbService'; // これに変える！

export async function GET() {
  try {
    // 関数を直接呼び出す
    const data = await fetchFullGraphData();
    
    console.log("--- API DEBUG ---");
    console.log("Nodes count:", data.nodes?.length);

    return NextResponse.json(data);//クライアントに返される。
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ nodes: [], links: [] }, { status: 500 });
  }
}