import { NextResponse } from 'next/server';
export function falha(error: unknown, message='Não foi possível processar a solicitação.') {
 console.error('Falha:', error instanceof Error ? error.message : 'desconhecida');
 return NextResponse.json({erro:message},{status:500});
}
