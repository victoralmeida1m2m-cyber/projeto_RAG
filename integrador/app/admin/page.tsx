'use client';
import {useCallback,useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,KeyRound,LoaderCircle,LogIn,LogOut,ShieldCheck} from 'lucide-react';
type State={autenticado:boolean;email:string|null;inicializado:boolean};
export default function AdminPage(){
 const [state,setState]=useState<State|null>(null);
 const [email,setEmail]=useState('');
 const [senha,setSenha]=useState('');
 const [chave,setChave]=useState('');
 const [atual,setAtual]=useState('');
 const [nova,setNova]=useState('');
 const [mensagem,setMensagem]=useState('');
 const [erro,setErro]=useState('');
 const [carregando,setCarregando]=useState(true);
 const [ocupado,setOcupado]=useState(false);
 const [testandoIA,setTestandoIA]=useState(false);
 const [resultadoIA,setResultadoIA]=useState('');
 const carregar=useCallback(async()=>{
  try{
   const res=await fetch('/api/auth/me',{cache:'no-store'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.erro||'Falha ao verificar sessão.');
   setState(data);
  }catch(e){setErro(e instanceof Error?e.message:'Erro de autenticação.');}
  finally{setCarregando(false)}
 },[]);
 useEffect(()=>{void carregar()},[carregar]);
 async function entrar(e:React.FormEvent){
  e.preventDefault();setErro('');setMensagem('');setOcupado(true);
  const cadastro=state&&!state.inicializado;
  try{
   const res=await fetch(cadastro?'/api/auth/setup':'/api/auth/login',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({email,senha,...(cadastro?{chave}:{})})
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data.erro||'Não foi possível autenticar.');
   setSenha('');setChave('');setState({autenticado:true,inicializado:true,email:data.email});
   setMensagem(cadastro?'Conta criada. Sua sessão administrativa está ativa.':'Sessão iniciada com sucesso.');
  }catch(e){setErro(e instanceof Error?e.message:'Erro inesperado.')}
  finally{setOcupado(false)}
 }
 async function sair(){
  setErro('');setMensagem('');setOcupado(true);
  try{
   const res=await fetch('/api/auth/logout',{method:'POST'});
   if(!res.ok)throw new Error('Falha ao encerrar sessão.');
   setState({autenticado:false,email:null,inicializado:true});
   setSenha('');setAtual('');setNova('');
   setMensagem('Sessão encerrada.');
  }catch(e){setErro(e instanceof Error?e.message:'Falha ao sair.')}
  finally{setOcupado(false)}
 }
 async function testarIA(){
  setErro('');setResultadoIA('');setTestandoIA(true);
  try{
   const res=await fetch('/api/admin/testar-ia',{method:'POST',cache:'no-store'});
   const dados=await res.json();
   if(!res.ok)throw new Error(dados.erro||'Falha ao consultar o Hugging Face.');
   setResultadoIA('Teste aprovado! Hugging Face respondeu ao sistema pelo modelo '+dados.modelo+'.');
  }catch(e){setErro(e instanceof Error?e.message:'Falha no teste.')}
  finally{setTestandoIA(false)}
 }
 async function trocarSenha(e:React.FormEvent){
  e.preventDefault();setErro('');setMensagem('');setOcupado(true);
  try{
   const res=await fetch('/api/auth/change-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({atual,nova})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.erro||'Não foi possível alterar a senha.');
   setAtual('');setNova('');setMensagem('Senha atualizada. Suas outras sessões foram encerradas.');
  }catch(e){setErro(e instanceof Error?e.message:'Erro ao alterar senha.')}
  finally{setOcupado(false)}
 }
 return <div className="app-shell">
  <header className="topbar"><a className="wordmark" href="/">edital<span>.fácil</span><small> / ADMINISTRAÇÃO</small></a><a className="outline-btn" href="/"><ArrowLeft size={17}/> Voltar ao sistema</a></header>
  <main className="admin-page">
   <div className="eyebrow"><span className="dot"/> SEGURANÇA DE ACESSO <span className="line"/> PIT 2026</div>
   <h1>ÁREA DO <em>ADMINISTRADOR.</em></h1>
   <p className="lead">Gerencie editais com uma conta protegida. Visitantes podem consultar os documentos publicados e utilizar a IA com limites de acesso.</p>
   {erro&&<div className="notice error" role="alert">{erro}</div>}
   {mensagem&&<div className="notice success" role="status"><CheckCircle2 size={17}/>{mensagem}</div>}
   {carregando?<div className="form-card"><p>Verificando a sessão...</p></div>:!state?<div className="form-card"><p>Não foi possível carregar o estado do administrador. Atualize a página.</p><button className="action" onClick={()=>{setCarregando(true);void carregar()}}>Tentar novamente</button></div>:
    state.autenticado?<div className="admin-content">
     <section className="form-card">
      <div className="admin-title"><ShieldCheck size={25}/><div><h2>Sessão administrativa ativa</h2><p>{state.email}</p></div></div>
      <p className="helper">Você já pode adicionar, arquivar e excluir editais. A sessão expira em até 12 horas.</p>
      <div className="admin-buttons"><a href="/" className="action">Acessar biblioteca <ArrowRight size={17}/></a><button disabled={ocupado} className="outline-btn" onClick={sair}><LogOut size={17}/> Sair</button></div>
     </section>
     <section className="form-card">
      <div className="admin-title"><ShieldCheck size={24}/><div><h2>Diagnóstico do Hugging Face</h2><p>Teste se o token e o modelo permitem respostas reais da IA.</p></div></div>
      <p className="helper">O teste envia apenas uma mensagem curta ao modelo. Requer uma cota disponível e não envia seus editais.</p>
      <button className="action" disabled={testandoIA} onClick={()=>void testarIA()}>{testandoIA?<LoaderCircle className="spin" size={17}/>:<ShieldCheck size={17}/>} Testar conexão com a IA</button>
      {resultadoIA&&<div className="notice success" role="status"><CheckCircle2 size={17}/>{resultadoIA}</div>}
     </section>
     <section className="form-card">
      <div className="admin-title"><KeyRound size={24}/><h2>Alterar senha</h2></div>
      <form onSubmit={trocarSenha} className="admin-fields">
       <label>Senha atual<input type="password" autoComplete="current-password" required minLength={12} value={atual} onChange={e=>setAtual(e.target.value)}/></label>
       <label>Nova senha (mínimo 12 caracteres)<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={nova} onChange={e=>setNova(e.target.value)}/></label>
       <button disabled={ocupado} className="action">{ocupado?<LoaderCircle className="spin" size={17}/>:<KeyRound size={17}/>} Alterar senha</button>
      </form>
     </section>
    </div>:<section className="form-card">
     <div className="admin-title"><LogIn size={25}/><div><h2>{state.inicializado?'Entrar na sua conta':'Ativar administrador'}</h2><p>{state.inicializado?'Use seu e-mail e sua senha cadastrada.':'Configure sua conta uma única vez.'}</p></div></div>
     {!state.inicializado&&<div className="notice info">No primeiro acesso, informe o código inicial ADMIN_WRITE_KEY configurado na Vercel, além de criar o e-mail e a senha. Após a ativação, esse código não será mais pedido para entrar.</div>}
     <form onSubmit={entrar} className="admin-fields">
      <label>E-mail de administrador<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu-email@exemplo.com"/></label>
      <label>Senha {state.inicializado?'':'(mínimo 12 caracteres)'}<input type="password" autoComplete={state.inicializado?'current-password':'new-password'} minLength={state.inicializado?1:12} maxLength={128} required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha de acesso"/></label>
      {!state.inicializado&&<label>Código inicial de ativação<input type="password" autoComplete="off" required value={chave} onChange={e=>setChave(e.target.value)} placeholder="Código cadastrado em ADMIN_WRITE_KEY"/></label>}
      <button type="submit" className="action" disabled={ocupado}>{ocupado?<LoaderCircle size={17} className="spin"/>:<ArrowRight size={17}/>} {state.inicializado?'Entrar no painel':'Criar conta e ativar'}</button>
     </form>
     <p className="helper">Senha armazenada apenas como hash no Neon. A sessão utiliza um cookie seguro e não salva sua senha no navegador.</p>
    </section>}
  </main>
 </div>;
}
