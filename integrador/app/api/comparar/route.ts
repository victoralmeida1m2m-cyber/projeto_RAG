import {lerPdf} from '@/lib/pdf';
import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const maxDuration=60;
function linhas(texto:string){return texto.split(/\n/).map(x=>x.trim()).filter(x=>x.length>12).slice(0,1200)}
export async function POST(req:Request){
 try{
  const form=await req.formData();
  const a=form.get('original'), b=form.get('novo');
  if(!(a instanceof File)||!(b instanceof File))return NextResponse.json({erro:'Envie os dois PDFs.'},{status:400});
  const [original,atual]=await Promise.all([lerPdf(a),lerPdf(b)]);
  const s1=new Set(linhas(original.paginas.join('\n'))),s2=new Set(linhas(atual.paginas.join('\n')));
  const adicionadas=[...s2].filter(x=>!s1.has(x)).slice(0,40);
  const removidas=[...s1].filter(x=>!s2.has(x)).slice(0,40);
  const retificacoes=[...atual.paginas.join('\n').matchAll(/onde se lê\s*[:\-]?\s*(.{8,250}?)\s*leia-se\s*[:\-]?\s*(.{8,250}?)(?:\n|$)/gim)]
   .slice(0,25).map(m=>({antes:m[1].trim(),depois:m[2].trim()}));
  return NextResponse.json({adicionadas,removidas,retificacoes,originalPaginas:original.totalPaginas,novoPaginas:atual.totalPaginas,aviso:'Comparação textual aproximada: tabelas e páginas digitalizadas podem afetar os resultados.'});
 }catch(e){return NextResponse.json({erro:e instanceof Error?e.message:'Falha na comparação'},{status:400})}
}
