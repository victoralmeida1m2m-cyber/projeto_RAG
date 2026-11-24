import { NextResponse } from 'next/server';
import { currentAdmin,validOrigin } from '@/lib/auth';
import { consumeLimit,globalKey } from '@/lib/rate-limit';
import { generateGemini,configuredGeminiModel,geminiErrorMessage } from '@/lib/gemini';
import { db } from '@/lib/db';
import { falha } from '@/lib/responses';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não permitida.'},{status:403});
 try{
  if(!(await currentAdmin(req)))return NextResponse.json({erro:'Entre como administrador para realizar o teste.'},{status:401});
  const key=process.env.GEMINI_API_KEY;
  if(!key)return NextResponse.json({erro:'GEMINI_API_KEY não configurada na Vercel.'},{status:503});
  if(!(await consumeLimit(globalKey('gemini-diagnostico'),5,1440)))
   return NextResponse.json({erro:'Limite de 5 diagnósticos por 24 horas atingido.'},{status:429});
  if(!(await consumeLimit(globalKey('gemini-global'),50,1440)))
   return NextResponse.json({erro:'Limite global de IA atingido por hoje.'},{status:429});
  const modelo=configuredGeminiModel();
  const result=await generateGemini({
   key,model:modelo,
   system:'Responda somente com base na fonte fornecida, citando [1].',
   prompt:'FONTE [1]: O prazo de inscrição encerra em 15 de novembro de 2026.\nPERGUNTA: Quando acaba a inscrição?',
   maxOutputTokens:320,timeoutMs:20000
  });
  if(result.ok===false)return NextResponse.json({erro:geminiErrorMessage(result),codigo:'GEMINI_'+result.status,categoria:result.category},{status:502});
  if(!result.text.includes('[1]')||!result.text.includes('15 de novembro de 2026'))
   return NextResponse.json({erro:'A IA respondeu, mas a resposta do teste não apresentou a fonte ou a data esperada. Consulte as referências antes de usar.'},{status:502});
  const sql=db();
  await sql`INSERT INTO ai_model_config(id,model,validado_em) VALUES(1,${modelo},NOW()) ON CONFLICT(id) DO UPDATE SET model=EXCLUDED.model,validado_em=EXCLUDED.validado_em`;
  return NextResponse.json({ok:true,modelo,referenciaValida:true,tentativas:1},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return falha(e,'Não foi possível concluir o diagnóstico da IA.')}
}
