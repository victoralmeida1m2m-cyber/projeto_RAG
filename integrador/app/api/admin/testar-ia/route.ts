import { NextResponse } from 'next/server';
import { currentAdmin, validOrigin } from '@/lib/auth';
import { consumeLimit, globalKey } from '@/lib/rate-limit';
import { falha } from '@/lib/responses';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não permitida.'},{status:403});
 try{
  if(!(await currentAdmin(req)))return NextResponse.json({erro:'Entre como administrador para realizar este teste.'},{status:401});
  const token=process.env.HF_TOKEN;
  if(!token)return NextResponse.json({erro:'HF_TOKEN ainda não está configurada na Vercel.'},{status:503});
  if(!(await consumeLimit(globalKey('hf-diagnostico'),5,1440)))
   return NextResponse.json({erro:'Limite de 5 testes da IA em 24 horas atingido.'},{status:429});
  if(!(await consumeLimit(globalKey('hf-global'),50,1440)))
   return NextResponse.json({erro:'Limite global de IA atingido por hoje.'},{status:429});
  const modelo=process.env.HF_MODEL||'Qwen/Qwen2.5-7B-Instruct:fastest';
  const ai=await fetch('https://router.huggingface.co/v1/chat/completions',{
   method:'POST',
   headers:{'content-type':'application/json',Authorization:'Bearer '+token},
   body:JSON.stringify({model:modelo,messages:[{role:'user',content:'Responda apenas a palavra OK.'}],max_tokens:20,stream:false}),
   signal:AbortSignal.timeout(27000),
   cache:'no-store'
  });
  if(!ai.ok){
   let categoria='';
   try{
    const json=await ai.json();
    const err=json?.error;
    const message=String(typeof err==='string'?err:err?.message||'').toLowerCase();
    if(/credit|balance|billing|payment|insufficient/.test(message))categoria='credito';
    else if(/model|provider|not.found|unavailable|supported/.test(message))categoria='modelo';
    else if(/permission|token|access|forbidden/.test(message))categoria='permissao';
   }catch{}
   console.error('HF teste HTTP',ai.status,'categoria',categoria||'nao_identificada');
   const orientacao=ai.status===401?'Token não aceito. Confira HF_TOKEN na Vercel.':
    ai.status===402?'Sem créditos de inferência disponíveis na conta Hugging Face.':
    ai.status===403?'O token ou conta não tem permissão para o Inference Providers.':
    ai.status===404||ai.status===422?'Modelo não disponível. Selecione outro ID compatível em HF_MODEL.':
    ai.status===429?'Limite de requisições do Hugging Face atingido.':
    'A API Hugging Face respondeu HTTP '+ai.status+'. Confira o modelo e o painel da conta.';
   return NextResponse.json({erro:orientacao,codigo:'HF_'+ai.status,categoria},{status:502});
  }
  const data=await ai.json();
  const answer=String(data.choices?.[0]?.message?.content??'').trim();
  if(!answer)return NextResponse.json({erro:'A IA respondeu sem texto. Verifique HF_MODEL.'},{status:502});
  return NextResponse.json({ok:true,modelo},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return falha(e,'Não foi possível concluir o diagnóstico da IA.')}
}
