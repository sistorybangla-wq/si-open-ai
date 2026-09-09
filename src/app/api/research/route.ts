import { NextRequest, NextResponse } from 'next/server';
import { deepResearch } from '@/lib/ai';
export async function POST(req: NextRequest) {
  try { const { query } = await req.json(); return NextResponse.json(await deepResearch(query)); } 
  catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
