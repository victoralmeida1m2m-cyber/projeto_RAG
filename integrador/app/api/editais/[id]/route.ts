import { db } from '@/lib/db';
import { falha, naoAutorizado } from '@/lib/responses';
import { NextResponse } from 'next/server';
export const runtime='nodejs';
type Ctx={params:Promise<{id:string}>};
async function routeId(ctx:Ctx){const n=Number((await ctx.params).id);return Number.isSafeInteger(n)&&n>0?n:null}
export async function GET(_req:Request,ctx:Ctx){
 const id=await routeId(ctx);if(!id)return NextResponse.json({erro:'ID inválido'},{status:400});
 try{
  const sql=db();const rows=await sql`SELECT id,concurso,cargo,nome_arquivo,status,total_paginas,criado_em FROM editais WHERE id=${id}`;
  return rows.length?NextResponse.json({edital:rows[0]}):NextResponse.json({erro:'Não encontrado'},{status:404});
 }catch(e){return falha(e)}
}
export async function PATCH(req:Request,ctx:Ctx){
 const id=await routeId(ctx);if(!id)return NextResponse.json({erro:'ID inválido'},{status:400});
 if(naoAutorizado(req))return NextResponse.json({erro:'Chave inválida'},{status:403});
 try{
  const body=await req.json();
  if(body.status!=='publicado'&&body.status!=='arquivado')return NextResponse.json({erro:'Status inválido'},{status:400});
  const sql=db();const rows=await sql`UPDATE editais SET status=${body.status} WHERE id=${id} RETURNING id,status`;
  return rows.length?NextResponse.json({edital:rows[0]}):NextResponse.json({erro:'Não encontrado'},{status:404});
 }catch(e){return falha(e)}
}
export async function DELETE(req:Request,ctx:Ctx){
 const id=await routeId(ctx);if(!id)return NextResponse.json({erro:'ID inválido'},{status:400});
 if(naoAutorizado(req))return NextResponse.json({erro:'Chave inválida'},{status:403});
 try{
  const sql=db();const rows=await sql`DELETE FROM editais WHERE id=${id} RETURNING id`;
  return rows.length?NextResponse.json({removido:id}):NextResponse.json({erro:'Não encontrado'},{status:404});
 }catch(e){return falha(e)}
}
