import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';
export async function POST(req: NextRequest) {
  try { const { prompt, style } = await req.json(); return NextResponse.json(await generateImage(prompt, style)); } 
  catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
