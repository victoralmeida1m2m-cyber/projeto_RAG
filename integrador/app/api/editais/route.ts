import { db } from '@/lib/db';
import { quebrarTrechos, lerPdf } from '@/lib/pdf';
import { falha, naoAutorizado } from '@/lib/responses';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET() {
 try {
  const sql = db();
  const rows = await sql`SELECT e.id, e.concurso, e.cargo, e.nome_arquivo, e.status, e.total_paginas, e.criado_em, (SELECT COUNT(*)::int FROM trechos t WHERE t.edital_id=e.id) AS total_trechos FROM editais e ORDER BY e.criado_em DESC LIMIT 100`;
  return NextResponse.json({editais:rows});
 } catch (e) { return falha(e, 'Erro ao consultar editais.'); }
}
export async function POST(req: Request) {
 if (naoAutorizado(req)) return NextResponse.json({erro:'Chave administrativa inválida.'},{status:403});
 try {
  const form = await req.formData();
  const concurso=String(form.get('concurso')??'').trim();
  const cargo=String(form.get('cargo')??'').trim();
  const arquivo=form.get('arquivo');
  if (concurso.length<3||concurso.length>150||cargo.length<2||cargo.length>150)return NextResponse.json({erro:'Concurso ou cargo inválido.'},{status:400});
  if(!(arquivo instanceof File)||!arquivo.name.toLowerCase().endsWith('.pdf'))return NextResponse.json({erro:'Envie um documento PDF.'},{status:400});
  const {paginas,totalPaginas}=await lerPdf(arquivo);
  const trechos=quebrarTrechos(paginas);
  if(!trechos.length)return NextResponse.json({erro:'PDF sem texto aproveitável.'},{status:400});
  const payload=JSON.stringify(trechos);
  if(payload.length>2_000_000)return NextResponse.json({erro:'Conteúdo extraído ultrapassa 2 MB.'},{status:413});
  const sql=db();
  const rows=await sql`WITH novo AS (INSERT INTO editais(concurso,cargo,nome_arquivo,total_paginas) VALUES (${concurso},${cargo},${arquivo.name.slice(0,200)},${totalPaginas}) RETURNING id), gravados AS (INSERT INTO trechos (edital_id,pagina,sequencia,texto) SELECT novo.id,t.pagina,t.sequencia,t.texto FROM novo CROSS JOIN jsonb_to_recordset(${payload}::jsonb) AS t(pagina integer,sequencia integer,texto text) RETURNING id) SELECT (SELECT id FROM novo) AS id,(SELECT COUNT(*)::int FROM gravados) AS total_trechos`;
  return NextResponse.json({id:Number(rows[0].id),totalPaginas,totalTrechos:Number(rows[0].total_trechos)},{status:201});
 } catch(e) {
  if(e instanceof Error && /PDF|páginas|OCR|4 MB|extraível/.test(e.message))return NextResponse.json({erro:e.message},{status:400});
  return falha(e,'Erro no cadastro do edital.');
 }
}
