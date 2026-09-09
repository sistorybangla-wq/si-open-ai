import { NextRequest, NextResponse } from 'next/server';
import { codeAssistant } from '@/lib/ai';
export async function POST(req: NextRequest) {
  try { const { prompt, language } = await req.json(); return NextResponse.json(await codeAssistant(prompt, language)); } 
  catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
