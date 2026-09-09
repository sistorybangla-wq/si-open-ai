import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ status: 'healthy', app: 'SI OPEN AI', version: '15.0.0', time: new Date().toISOString() }); }
