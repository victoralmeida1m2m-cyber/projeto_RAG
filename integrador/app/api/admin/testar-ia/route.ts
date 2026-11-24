import { NextResponse } from 'next/server';
import { currentAdmin,validOrigin } from '@/lib/auth';
import { consumeLimit,globalKey } from '@/lib/rate-limit';
import { requestHF,candidateHFModels,errorMessageHF } from '@/lib/hf';
import { db } from '@/lib/db';
import { falha } from '@/lib/responses';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não permitida.'},{status:403});
 try{
  if(!(await currentAdmin(req)))return NextResponse.json({erro:'Entre como administrador para realizar o teste.'},{status:401});
  const token=process.env.HF_TOKEN;
  if(!token)return NextResponse.json({erro:'HF_TOKEN não configurada na Vercel.'},{status:503});
  if(!(await consumeLimit(globalKey('hf-diagnostico-v2'),5,1440)))
   return NextResponse.json({erro:'Limite de 5 diagnósticos por 24 horas atingido.'},{status:429});
  if(!(await consumeLimit(globalKey('hf-global'),50,1440)))
   return NextResponse.json({erro:'Limite global de IA atingido por hoje.'},{status:429});
  const sql=db();
  const salva=await sql`SELECT model FROM ai_model_config WHERE id=1 LIMIT 1`;
  const candidatos=[...new Set([...(salva.length?[String(salva[0].model)]:[]),...candidateHFModels()])].slice(0,4);
  const tentativas:{modelo:string;http:number;categoria:string}[]=[];
  for(const modelo of candidatos){
   const result=await requestHF({token,model:modelo,messages:[{role:'user',content:'Responda apenas OK.'}],maxTokens:96,timeoutMs:12000});
   if(result.ok){
    await sql`INSERT INTO ai_model_config(id,model,validado_em) VALUES(1,${modelo},NOW()) ON CONFLICT(id) DO UPDATE SET model=EXCLUDED.model,validado_em=EXCLUDED.validado_em`;
    return NextResponse.json({ok:true,modelo,tentativas:tentativas.length+1},{headers:{'Cache-Control':'no-store'}});
   }
   tentativas.push({modelo,http:result.status,categoria:result.category});
   // Repetir só para erro de modelo; problemas de token, formato, rede e cota não são resolvidos trocando modelos.
   if(result.category!=='modelo'){
    return NextResponse.json({erro:errorMessageHF(result),tentativas},{status:502});
   }
  }
  return NextResponse.json({erro:'Nenhum dos modelos testados ficou disponível. Verifique modelos e provedores habilitados na conta Hugging Face.',tentativas},{status:502});
 }catch(e){return falha(e,'Não foi possível concluir o diagnóstico da IA.')}
}
