export const DEFAULT_GEMINI_MODEL='gemini-3.5-flash-lite';
export type GeminiFailureCategory='modelo'|'permissao'|'cota'|'formato'|'rede'|'resposta'|'temporario'|'desconhecido';
export type GeminiResult=
 |{ok:true;model:string;text:string}
 |{ok:false;model:string;status:number;category:GeminiFailureCategory;code:string};
export function configuredGeminiModel(){return process.env.GEMINI_MODEL||DEFAULT_GEMINI_MODEL}
function category(status:number,code:string,message:string):GeminiFailureCategory{
 const e=(code+' '+message).toLowerCase();
 if(status===429||status===402||/resource_exhausted|quota|billing|credit|rate.limit/.test(e))return 'cota';
 if(status===401||status===403||/api_key_invalid|permission_denied|forbidden|invalid.api.key/.test(e))return 'permissao';
 if(status===404||/model.*(unavailable|not.found|not.supported|no.longer.available|retired)|model.not.found/.test(e))return 'modelo';
 if(status===400||status===422)return 'formato';
 if([500,502,503,504].includes(status))return 'temporario';
 return 'desconhecido';
}
export function geminiErrorMessage(result:Extract<GeminiResult,{ok:false}>){
 const status='HTTP '+result.status;
 switch(result.category){
  case 'modelo':return 'O modelo Gemini não está disponível para esta conta ('+status+'). Confira GEMINI_MODEL na Vercel.';
  case 'permissao':return 'A chave do Gemini não foi aceita ou não possui permissão ('+status+'). Confira GEMINI_API_KEY.';
  case 'cota':return 'A cota da Gemini API foi atingida ou o faturamento não está habilitado ('+status+'). Confira os limites no Google AI Studio.';
  case 'formato':return 'O Gemini rejeitou o formato ou os parâmetros da requisição ('+status+').';
  case 'rede':return 'Não foi possível acessar o Gemini. A operação não foi concluída; tente novamente mais tarde.';
  case 'temporario':return 'O Google Gemini está temporariamente sobrecarregado ('+status+'). O sistema já repetiu a tentativa; tente novamente mais tarde.';
  case 'resposta':return 'O Gemini não retornou uma resposta de texto válida. Tente outra pergunta.';
  default:return 'A Gemini API retornou '+status+'. Confira os logs de erro.';
 }
}
export async function generateGemini(input:{key:string;model:string;system:string;prompt:string;maxOutputTokens?:number;timeoutMs?:number}):Promise<GeminiResult>{
 const model=input.model.replace(/^models\//,'');
 if(!/^[a-z0-9][a-z0-9.-]{1,90}$/.test(model))return {ok:false,model,status:400,category:'formato',code:'INVALID_MODEL_ID'};
 const endpoint='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';
 const requestBody=JSON.stringify({
  systemInstruction:{parts:[{text:input.system}]},
  contents:[{role:'user',parts:[{text:input.prompt}]}],
  generationConfig:{temperature:0.15,maxOutputTokens:input.maxOutputTokens??768}
 });
 // Até duas tentativas em 5xx/transientes. Nenhuma repetição em 401/403/429: evita gasto e violações de cota.
 const maxAttempts=2;
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  try{
   const r=await fetch(endpoint,{
    method:'POST',cache:'no-store',
    headers:{'content-type':'application/json','x-goog-api-key':input.key},
    body:requestBody,
    signal:AbortSignal.timeout(Math.min(input.timeoutMs??20000,16000))
   });
   const obj=await r.json().catch(()=>null);
   if(!r.ok){
    const code=String(obj?.error?.status??'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,55);
    const message=String(obj?.error?.message??'').slice(0,700);
    const reason=category(r.status,code,message);
    if(reason==='temporario'&&attempt<maxAttempts){
     console.warn('GEMINI_RETRY',{status:r.status,model,attempt});
     await new Promise(resolve=>setTimeout(resolve,850));
     continue;
    }
    // Não registrar a chave, os PDFs nem a resposta bruta do Google.
    console.error('GEMINI_HTTP',{status:r.status,reason,code,model,attempt});
    return {ok:false,model,status:r.status,category:reason,code};
   }
   const parts=obj?.candidates?.[0]?.content?.parts;
   const answer=Array.isArray(parts)?
    parts.filter((p:unknown)=>typeof p==='object'&&p!==null&&'text' in p&&!('thought' in p&&(p as {thought?:boolean}).thought))
      .map((p:unknown)=>String((p as {text:string}).text)).join('').trim():'';
   if(!answer){
    console.error('GEMINI_EMPTY',{model,finishReason:String(obj?.candidates?.[0]?.finishReason||'unknown').slice(0,30)});
    return {ok:false,model,status:502,category:'resposta',code:'EMPTY_TEXT'};
   }
   return {ok:true,model,text:answer};
  }catch(e){
   if(attempt<maxAttempts){
    console.warn('GEMINI_RETRY_NETWORK',{model,attempt});
    await new Promise(resolve=>setTimeout(resolve,850));
    continue;
   }
   console.error('GEMINI_NETWORK',{model,name:e instanceof Error?e.name:'unknown'});
   return {ok:false,model,status:503,category:'rede',code:'NETWORK_ERROR'};
  }
 }
 return {ok:false,model,status:503,category:'temporario',code:'UNAVAILABLE'};
}
