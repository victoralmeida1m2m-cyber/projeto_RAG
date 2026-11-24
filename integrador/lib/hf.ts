type Message={role:'system'|'user';content:string};
type FailureCategory='modelo'|'permissao'|'cota'|'formato'|'rede'|'resposta'|'desconhecido';
export type HfResult=
 |{ok:true;model:string;text:string}
 |{ok:false;model:string;status:number;category:FailureCategory;code:string};
const DEFAULT_MODEL='openai/gpt-oss-20b:fastest';
export function defaultHFModel(){return process.env.HF_MODEL||DEFAULT_MODEL}
export function candidateHFModels(){
 // Tentativas limitadas e exclusivas para diagnóstico autenticado.
 return [...new Set([
  defaultHFModel(),
  'openai/gpt-oss-20b:fastest',
  'Qwen/Qwen3-32B:fastest',
  'openai/gpt-oss-120b:fastest'
 ])].slice(0,4);
}
function categorize(status:number,message:string):FailureCategory{
 const msg=message.toLowerCase();
 if([401,403].includes(status)||/unauthoriz|permission|forbidden|token|access.denied/.test(msg))return 'permissao';
 if([402,429].includes(status)||/credit|billing|balance|rate.limit|quota|insufficient/.test(msg))return 'cota';
 if(/model|provider|not.served|not.supported|not.available|routing|not.found|deprecat/.test(msg))return 'modelo';
 if(status===400||status===422)return 'formato';
 return 'desconhecido';
}
export function errorMessageHF(r:Extract<HfResult,{ok:false}>):string{
 if(r.category==='modelo')return 'O modelo '+r.model+' não está disponível para esta chamada (HTTP '+r.status+'). Execute o diagnóstico no painel para selecionar outro.';
 if(r.category==='permissao')return 'O Hugging Face recusou a autenticação ou permissão (HTTP '+r.status+'). Confira o HF_TOKEN e as permissões de Inference Providers.';
 if(r.category==='cota')return 'A conta Hugging Face está sem créditos disponíveis ou atingiu o limite de uso (HTTP '+r.status+').';
 if(r.category==='formato')return 'O Hugging Face rejeitou os parâmetros da requisição (HTTP '+r.status+'). Verifique a compatibilidade do modelo.';
 if(r.category==='rede')return 'Falha de conexão com Hugging Face. Confira o serviço e tente novamente.';
 if(r.category==='resposta')return 'O modelo respondeu sem conteúdo de texto válido.';
 return 'Falha na API Hugging Face (HTTP '+r.status+'). Consulte os logs do servidor.';
}
export async function requestHF(input:{token:string;model:string;messages:Message[];maxTokens?:number;timeoutMs?:number}):Promise<HfResult>{
 try{
  const ai=await fetch('https://router.huggingface.co/v1/chat/completions',{
   method:'POST',
   headers:{'content-type':'application/json',authorization:'Bearer '+input.token},
   body:JSON.stringify({
    model:input.model,messages:input.messages,stream:false,max_tokens:input.maxTokens??640
   }),
   cache:'no-store',
   signal:AbortSignal.timeout(input.timeoutMs??16000)
  });
  const body=await ai.json().catch(()=>null);
  if(!ai.ok){
   const problem=body?.error;
   const msg=String(typeof problem==='string'?problem:(problem?.message??body?.message??'')).slice(0,1000);
   const rawCode=String(typeof problem==='object'?(problem?.code??problem?.type??''):'');
   const code=rawCode.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40);
   const category=categorize(ai.status,msg);
   console.error('HF_HTTP',{status:ai.status,category,code,model:input.model});
   return {ok:false,model:input.model,status:ai.status,category,code};
  }
  const content=body?.choices?.[0]?.message?.content;
  const answer=typeof content==='string'?content.trim():Array.isArray(content)?
   content.map((c:unknown)=>typeof c==='object'&&c!==null&&'text' in c?String(c.text??''):'').join('').trim():'';
  if(!answer)return {ok:false,model:input.model,status:502,category:'resposta',code:'empty_text'};
  return {ok:true,model:input.model,text:answer};
 }catch(e){
  console.error('HF_NETWORK',{model:input.model,reason:e instanceof Error?e.name:'error'});
  return {ok:false,model:input.model,status:503,category:'rede',code:'connection_failed'};
 }
}
