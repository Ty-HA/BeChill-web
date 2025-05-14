// src/app/api/fetch-wallet/route.ts
import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  try {
    // ton traitement ici
    const data = { message: 'Wallet fetched successfully' };

    return NextResponse.json(data); // ✅ retourne une Response
  } catch (error) {
    console.error('Erreur dans GET /fetch-wallet:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
