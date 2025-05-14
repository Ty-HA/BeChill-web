// app/api/portfolio/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://pro-api.solscan.io/v2.0/account/portfolio?address=${address}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        token: process.env.SOLSCAN_API_KEY!, // stocké dans .env
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur API' }, { status: 500 });
  }
}
