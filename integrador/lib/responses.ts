import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
export function falha(error: unknown, message='Não foi possível processar a solicitação.') {
 console.error('Falha:', error instanceof Error ? error.message : 'desconhecida');
 return NextResponse.json({erro:message},{status:500});
}
export function naoAutorizado(req: Request): boolean {
 const key=process.env.ADMIN_WRITE_KEY;
 const provided=req.headers.get('x-admin-key');
 if(!key||key.length<16||!provided) return true;
 const a=Buffer.from(key), b=Buffer.from(provided);
 return a.length!==b.length || !timingSafeEqual(a,b);
}
