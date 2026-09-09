import { NextRequest, NextResponse } from 'next/server';
import { callGemini, callGroq } from '@/lib/ai';
export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    const result = model?.startsWith('llama') || model?.startsWith('mixtral') 
      ? await callGroq(messages, model) 
      : await callGemini(messages, model || 'gemini-2.5-flash');
    return NextResponse.json(result);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
