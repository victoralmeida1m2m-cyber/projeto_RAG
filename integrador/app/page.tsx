'use client';
import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ScribbleNav from '@/components/ScribbleNav';
const VectorWordmark=dynamic(()=>import('@/components/VectorWordmark'),{ssr:false});
import { ArrowRight, BookOpen, CheckCircle2, FileDiff, FilePlus2, FileSearch, LoaderCircle, LockKeyhole, RefreshCcw, ShieldCheck, Trash2, Sparkles, Search, Files, WandSparkles, ArrowUpRight, ChevronRight, Send, Layers3, FolderOpen, PanelRightOpen, CircleDot, Zap, FileText, Menu, X, Clock3 } from 'lucide-react';
type Guia='biblioteca'|'cadastro'|'assistente'|'comparador';
type Edital={id:string;concurso:string;cargo:string;nome_arquivo:string;status:string;total_paginas:number;total_trechos:number};
type Fonte={numero:number;pagina:number;texto:string};
const areas:{id:Guia;nome:string;numero:string}[]=[
 {id:'assistente',nome:'Assistente IA',numero:'01'},
 {id:'biblioteca',nome:'Biblioteca',numero:'02'},
 {id:'comparador',nome:'Comparar versões',numero:'03'},
 {id:'cadastro',nome:'Cadastrar edital',numero:'04'}
];
export default function Home(){
 const [area,setArea]=useState<Guia>('assistente');
 const [editais,setEditais]=useState<Edital[]>([]);
 const [selecionado,setSelecionado]=useState('');
 const [isAdmin,setIsAdmin]=useState(false);
 const [authChecked,setAuthChecked]=useState(false);
 const [concurso,setConcurso]=useState('');
 const [cargo,setCargo]=useState('');
 const [arquivo,setArquivo]=useState<File|null>(null);
 const [antigo,setAntigo]=useState<File|null>(null);
 const [novo,setNovo]=useState<File|null>(null);
 const [pergunta,setPergunta]=useState('');
 const [resposta,setResposta]=useState('');
 const [fontes,setFontes]=useState<Fonte[]>([]);
 const [comparacao,setComparacao]=useState<{adicionadas:string[];removidas:string[];retificacoes:{antes:string;depois:string}[];aviso:string}|null>(null);
 const [status,setStatus]=useState('');
 const [erro,setErro]=useState('');
 const [ocupado,setOcupado]=useState(false);
 const [carregando,setCarregando]=useState(true);
 const [busca,setBusca]=useState('');
 const [menuAberto,setMenuAberto]=useState(false);
 const [animacao,setAnimacao]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(min-width: 800px) and (prefers-reduced-motion: no-preference)');
  const change=()=>setAnimacao(media.matches);
  change();media.addEventListener('change',change);
  return ()=>media.removeEventListener('change',change);
 },[]);
 const carregar=useCallback(async()=>{
   try{
    const res=await fetch('/api/editais',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw new Error(data.erro||'Falha ao consultar o banco de dados.');
    setEditais(data.editais||[]);
    setSelecionado(atual=>{const visiveis=(data.editais||[]).filter((x:Edital)=>x.status==='publicado');return visiveis.some((x:Edital)=>String(x.id)===atual)?atual:(visiveis[0]?String(visiveis[0].id):'');});
   }catch(e){setErro(e instanceof Error?e.message:'Erro ao consultar editais.')}
   finally{setCarregando(false)}
 },[]);
 useEffect(()=>{void carregar()},[carregar]);
 useEffect(()=>{let ativo=true;
  void fetch('/api/auth/me',{cache:'no-store'}).then(r=>r.json()).then(data=>{
   if(!ativo)return;
   setIsAdmin(!!data.autenticado);setAuthChecked(true);
   if(data.autenticado)void carregar();
  }).catch(()=>{if(ativo)setAuthChecked(true)});
  return ()=>{ativo=false};
 },[carregar]);
 function preparar(){setStatus('');setErro('')}
 async function salvar(e:React.FormEvent){
  e.preventDefault();preparar();
  if(!arquivo){setErro('Selecione um PDF com texto selecionável.');return}
  setOcupado(true);
  try{
   const dados=new FormData();dados.set('concurso',concurso);dados.set('cargo',cargo);dados.set('arquivo',arquivo);
   const res=await fetch('/api/editais',{method:'POST',headers:{},body:dados});
   const json=await res.json();if(!res.ok)throw new Error(json.erro||'Falha no cadastro.');
   setStatus('Edital salvo no PostgreSQL com '+json.totalTrechos+' trechos. Atualize a página para comprovar persistência.');
   setConcurso('');setCargo('');setArquivo(null);setSelecionado(String(json.id));await carregar();
  }catch(e){setErro(e instanceof Error?e.message:'Não foi possível cadastrar.')}
  finally{setOcupado(false)}
 }
 async function mudar(edital:Edital,acao:'arquivar'|'publicar'|'remover'){
   preparar();if(acao==='remover'&&!confirm('Excluir o edital e seus trechos permanentemente?'))return;
   setOcupado(true);
   try{
    const rem=acao==='remover';const res=await fetch('/api/editais/'+edital.id,{
     method:rem?'DELETE':'PATCH',
     headers:{...(rem?{}:{'content-type':'application/json'})},
     ...(rem?{}:{body:JSON.stringify({status:acao==='arquivar'?'arquivado':'publicado'})})
    });
    const data=await res.json();if(!res.ok)throw new Error(data.erro||'Falha na operação.');
    setStatus(rem?'Edital removido.':'Status atualizado no banco.');await carregar();
   }catch(e){setErro(e instanceof Error?e.message:'Falha na operação.')}
   finally{setOcupado(false)}
 }
 async function perguntar(e:React.FormEvent){
  e.preventDefault();preparar();setRespostasLimpas();setOcupado(true);
  try{
   const res=await fetch('/api/ia',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({edital_id:selecionado,pergunta})});
   const dados=await res.json();if(!res.ok)throw new Error(dados.erro||'Não foi possível consultar a IA.');
   setResposta(dados.resposta);setFontes(dados.fontes||[]);setStatus('Consulta concluída e registrada no histórico do banco.');
  }catch(e){setErro(e instanceof Error?e.message:'Falha na IA.')}
  finally{setOcupado(false)}
 }
 function setRespostasLimpas(){setResposta('');setFontes([])}
 async function comparar(e:React.FormEvent){
  e.preventDefault();preparar();setComparacao(null);
  if(!antigo||!novo){setErro('Selecione os dois PDFs.');return}
  setOcupado(true);
  try{
   const form=new FormData();form.set('original',antigo);form.set('novo',novo);
   const res=await fetch('/api/comparar',{method:'POST',body:form});
   const dados=await res.json();if(!res.ok)throw new Error(dados.erro||'Falha ao comparar arquivos.');
   setComparacao(dados);setStatus('Comparação textual concluída.');
  }catch(e){setErro(e instanceof Error?e.message:'Falha no comparador.')}
  finally{setOcupado(false)}
 }

 const publicados=editais.filter(e=>e.status==='publicado');
 const visiveis=editais.filter(e=>isAdmin||e.status==='publicado').filter(e=>(e.concurso+' '+e.cargo+' '+e.nome_arquivo).toLowerCase().includes(busca.toLowerCase()));
 const escolhido=publicados.find(e=>String(e.id)===selecionado);
 const escolher=(id:Guia)=>{setArea(id);setMenuAberto(false);preparar();};
 const exemplos=['Quais são os requisitos para esse cargo?','Qual o salário e a carga horária?','Como funciona a seleção?'];
 return <div className="studio">
  <aside className={'studio-sidebar '+(menuAberto?'mobile-open':'')}>
   <div className="studio-brand">
    <a href="/" className="studio-logo" aria-label="Edital Fácil, início"><span className="studio-logo-symbol"><FileText size={19}/></span><span>edital<span className="studio-brand-green">.fácil</span><small>AI WORKSPACE</small></span></a>
    <button type="button" className="studio-mobile-close" onClick={()=>setMenuAberto(false)} aria-label="Fechar menu"><X size={20}/></button>
   </div>
   <div className="studio-sidebar-group"><span className="studio-sidebar-label">ESPAÇO DE TRABALHO</span><ScribbleNav items={areas.filter(a=>a.id!=='cadastro'||isAdmin)} value={area} onSelect={escolher}/></div>
   <div className="studio-sidebar-group studio-recent">
    <div className="studio-recent-head"><span className="studio-sidebar-label">SEUS DOCUMENTOS</span><span className="studio-count">{publicados.length}</span></div>
    {publicados.length===0?<p className="studio-recent-empty">Os editais publicados aparecerão aqui.</p>:
      publicados.slice(0,3).map(e=><button key={e.id} type="button" className="studio-recent-item" onClick={()=>{setSelecionado(e.id);escolher('assistente')}}><span className="studio-file-tile"><FileText size={15}/></span><span><strong>{e.concurso}</strong><small>{e.cargo}</small></span></button>)}
   </div>
   <div className="studio-sidebar-bottom">
    <div className="studio-status-pod"><div className="studio-status-head"><span className="studio-live-dot"/> SISTEMA ONLINE</div><p>Seus editais, respostas e fontes organizados em um só lugar.</p><span className="studio-status-pill"><ShieldCheck size={13}/> Dados no Neon</span></div>
    <a className="studio-account-link" href="/admin"><span className="studio-avatar">{isAdmin?'AD':'EF'}</span><span><strong>{isAdmin?'Administrador':'Acesso visitante'}</strong><small>{isAdmin?'Gerenciar minha conta':'Entrar como administrador'}</small></span><ArrowUpRight size={17}/></a>
   </div>
  </aside>
  {menuAberto&&<button type="button" aria-label="Fechar navegação" className="studio-mobile-overlay" onClick={()=>setMenuAberto(false)}/>}
  <div className="studio-workspace">
   <header className="studio-header">
    <div className="studio-header-start">
     <button type="button" className="studio-menu-trigger" aria-label="Abrir navegação" onClick={()=>setMenuAberto(true)}><Menu size={22}/></button>
     <span className="studio-breadcrumb-base">Workspace</span><ChevronRight size={14}/><strong>{areas.find(a=>a.id===area)?.nome}</strong>
    </div>
    <div className="studio-header-end"><span className="studio-header-badge"><span className="studio-live-dot"/> Gemini conectado</span><a href="/admin" className="studio-header-action">{isAdmin?'Minha conta':'Entrar'}<ArrowUpRight size={16}/></a></div>
   </header>
   <main className="studio-main">
    {erro&&<div className="notice error studio-message" role="alert"><CircleDot size={18}/>{erro}</div>}
    {status&&<div className="notice success studio-message" role="status"><CheckCircle2 size={18}/>{status}</div>}
    {area==='assistente'&&<>
     <div className="studio-page-intro"><div><span className="studio-overline"><span className="studio-overline-star">✳</span> INTELIGÊNCIA DOCUMENTAL / EDIÇÃO 2026</span><h1>Seu edital.<br/><em>Sem entrelinhas.</em></h1><p>As respostas que você precisa, direto do documento. Consulte requisitos, prazos e informações importantes com inteligência artificial e fontes verificáveis.</p></div><div className="studio-intro-side"><div className="studio-orbit"><Sparkles size={26}/></div><span>Menos procura.<br/><strong>Mais clareza.</strong></span></div></div>
     <section className="studio-ai-stage" aria-label="Assistente de inteligência artificial">
      <div className="studio-stage-grain" aria-hidden="true"/>
      <div className="studio-wordmark-layer" aria-hidden="true">
       <span className="studio-static-wordmark">EDITAL</span>
       {animacao&&<div className="studio-wordmark-canvas"><VectorWordmark text="EDITAL" font={{fontFamily:'Arial, sans-serif',fontWeight:900,fontSize:'340px',letterSpacing:'-0.065em'}} textColor="#eaffca" shade="#b6ea74" background="#131b16" accent="rgba(183,239,88,0.4)" reach={250} speed={12} damping={84} handles={{labels:false,size:66,spread:26}} style={{minWidth:0,minHeight:0,width:'100%',height:'100%'}}/></div>}
      </div>
      <div className="studio-stage-content">
       <div className="studio-stage-top"><span className="studio-stage-label"><span className="studio-sparkle"><Sparkles size={14}/></span> ASSISTENTE INTELIGENTE</span><span className="studio-stage-top-status"><span className="studio-live-dot"/> ONLINE</span></div>
       <div className="studio-stage-heading"><span className="studio-stage-kicker">SUA PRÓXIMA RESPOSTA COMEÇA AQUI</span><h2>O que você quer<br/>saber sobre seu edital?</h2><p>Selecione um documento e pergunte. O Gemini localiza os trechos relevantes e responde com referências.</p></div>
       <form className="studio-prompt-form" onSubmit={perguntar}>
        <div className="studio-document-select"><FileText size={17}/><label htmlFor="studio-edital">EDITAL ATIVO</label><select id="studio-edital" value={selecionado} onChange={e=>setSelecionado(e.target.value)} required aria-label="Edital ativo">{publicados.length===0&&<option value="">Nenhum edital publicado</option>}{publicados.map(e=><option key={e.id} value={e.id}>{e.concurso} — {e.cargo}</option>)}</select><ChevronRight size={15}/></div>
        <label htmlFor="studio-question" className="studio-sr-only">Sua pergunta para o assistente</label>
        <textarea id="studio-question" required minLength={5} maxLength={600} value={pergunta} onChange={e=>setPergunta(e.target.value)} placeholder="Ex.: Quais são os requisitos para o cargo?" rows={3}/>
        <div className="studio-composer-bottom"><span><Sparkles size={14}/> Respostas com referências ao edital</span><button className="studio-send" type="submit" disabled={ocupado||!selecionado}>{ocupado?<LoaderCircle size={16} className="spin"/>:<Send size={16}/>} {ocupado?'Consultando...':'Perguntar à IA'}<ArrowUpRight size={16}/></button></div>
       </form>
       <div className="studio-prompts"><span>EXPERIMENTE:</span>{exemplos.map(x=><button type="button" key={x} onClick={()=>setPergunta(x)}>{x}<ArrowUpRight size={12}/></button>)}</div>
      </div>
     </section>
     {resposta&&<section className="studio-response" aria-live="polite"><div className="studio-result-head"><span className="studio-result-icon"><Sparkles size={19}/></span><div><strong>Resposta do assistente</strong><span>Gerada com o contexto do seu edital</span></div><span className="studio-result-check"><CheckCircle2 size={15}/> Consulta concluída</span></div><div className="studio-answer-text">{resposta}</div>{fontes.length>0&&<details className="studio-source-details"><summary><BookOpen size={18}/> Ver fontes consultadas ({fontes.length}) <ChevronRight size={17}/></summary><div className="studio-source-list">{fontes.map(f=><div className="studio-source-item" key={f.numero}><div><span>FONTE {String(f.numero).padStart(2,'0')}</span><strong>Página {f.pagina}</strong></div><p>{f.texto}</p></div>)}</div></details>}</section>}
     <div className="studio-summary-row"><div><span className="studio-block-eyebrow">VISÃO GERAL</span><h2>Seu espaço, organizado.</h2></div><span className="studio-muted">Tudo que você precisa em um só lugar.</span></div>
     <div className="studio-summary-grid">
      <button type="button" className="studio-overview-card" onClick={()=>escolher('biblioteca')}><span className="studio-overview-icon"><FolderOpen size={21}/></span><span className="studio-card-arrow"><ArrowUpRight size={18}/></span><strong>{editais.filter(e=>isAdmin||e.status==='publicado').length.toString().padStart(2,'0')}</strong><span className="studio-overview-title">Editais na biblioteca</span><small>Explore seus documentos <ChevronRight size={13}/></small></button>
      <button type="button" className="studio-overview-card" onClick={()=>escolher('comparador')}><span className="studio-overview-icon lilac"><Layers3 size={21}/></span><span className="studio-card-arrow"><ArrowUpRight size={18}/></span><strong><FileDiff size={25}/></strong><span className="studio-overview-title">Comparador de versões</span><small>Encontre o que mudou <ChevronRight size={13}/></small></button>
      <button type="button" className="studio-overview-card accent-card" onClick={()=>escolher('biblioteca')}><span className="studio-overview-icon"><FileSearch size={21}/></span><span className="studio-card-arrow"><ArrowUpRight size={18}/></span><strong><Sparkles size={25}/></strong><span className="studio-overview-title">Explore o acervo</span><small>Respostas começam nos dados <ChevronRight size={13}/></small></button>
     </div>
     <div className="studio-section-heading studio-recent-section"><div><span className="studio-block-eyebrow">DOCUMENTOS DISPONÍVEIS</span><h2>Prontos para consultar</h2></div><button className="studio-text-link" type="button" onClick={()=>escolher('biblioteca')}>Ver biblioteca completa <ArrowUpRight size={16}/></button></div>
     <div className="studio-mini-library">{carregando?<p>Carregando documentos...</p>:publicados.length===0?<div className="studio-empty">Nenhum edital publicado ainda.</div>:publicados.slice(0,3).map(e=><button type="button" className="studio-mini-row" key={e.id} onClick={()=>{setSelecionado(e.id);escolher('assistente')}}><span className="studio-mini-icon"><FileText size={20}/></span><span className="studio-mini-info"><strong>{e.concurso}</strong><small>{e.cargo} • {e.total_paginas} páginas</small></span><span className="studio-mini-pill"><span className="studio-live-dot"/> Publicado</span><ArrowUpRight size={18}/></button>)}</div>
    </>}
    {area==='biblioteca'&&<section className="studio-subpage">
     <div className="studio-section-heading studio-subpage-heading"><div><span className="studio-block-eyebrow">02 / BIBLIOTECA DIGITAL</span><h1>Seus documentos.<br/><em>Todos em ordem.</em></h1><p>Explore os editais publicados, filtre por concurso ou cargo e abra a IA com o documento selecionado.</p></div><div className="studio-section-icon"><BookOpen size={26}/></div></div>
     <div className="studio-library-toolbar"><div className="studio-search"><Search size={19}/><input type="search" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por concurso, cargo ou arquivo..." aria-label="Buscar editais"/></div><button className="studio-outline" type="button" onClick={()=>{setCarregando(true);void carregar()}}><RefreshCcw size={16}/> Atualizar</button>{isAdmin&&<button className="studio-primary" type="button" onClick={()=>escolher('cadastro')}><FilePlus2 size={17}/> Novo edital</button>}</div>
     <div className="studio-table-heading"><span>DOCUMENTOS</span><span>{visiveis.length} {visiveis.length===1?'RESULTADO':'RESULTADOS'}</span></div>
     {carregando?<div className="studio-empty"><LoaderCircle className="spin" size={25}/> Consultando banco...</div>:visiveis.length===0?<div className="studio-empty"><FolderOpen size={31}/><strong>Nenhum edital encontrado.</strong><p>Altere a busca ou atualize os documentos.</p></div>:
     <div className="studio-doc-grid">{visiveis.map(e=><article className="studio-doc-card" key={e.id}><div className="studio-doc-top"><span className="studio-doc-icon"><FileText size={23}/></span><span className={'studio-doc-badge '+(e.status==='publicado'?'is-published':'')}>{e.status}</span></div><span className="studio-doc-id">DOCUMENTO #{String(e.id).padStart(3,'0')}</span><h3>{e.concurso}</h3><p>{e.cargo}</p><div className="studio-doc-meta"><span><Files size={15}/> {e.total_paginas} páginas</span><span><Layers3 size={15}/> {e.total_trechos} trechos</span></div><p className="studio-file-name" title={e.nome_arquivo}>{e.nome_arquivo}</p><div className="studio-doc-actions"><button type="button" className="studio-doc-open" disabled={e.status!=='publicado'||ocupado} onClick={()=>{setSelecionado(e.id);escolher('assistente')}}>Conversar com IA <ArrowUpRight size={15}/></button>{isAdmin&&<button type="button" className="studio-small-action" disabled={ocupado} onClick={()=>void mudar(e,e.status==='publicado'?'arquivar':'publicar')}>{e.status==='publicado'?'Arquivar':'Publicar'}</button>}{isAdmin&&<button type="button" className="studio-small-danger" disabled={ocupado} aria-label={'Excluir '+e.concurso} title="Excluir edital" onClick={()=>void mudar(e,'remover')}><Trash2 size={16}/></button>}</div></article>)}</div>}
    </section>}
    {area==='cadastro'&&isAdmin&&<section className="studio-subpage"><div className="studio-section-heading studio-subpage-heading"><div><span className="studio-block-eyebrow">04 / ADMINISTRAÇÃO</span><h1>Adicionar um<br/><em>novo edital.</em></h1><p>Envie um PDF com texto selecionável. Os trechos serão indexados automaticamente no Neon.</p></div><div className="studio-section-icon"><FilePlus2 size={27}/></div></div><form className="studio-data-form" onSubmit={salvar}><div className="studio-form-header"><FilePlus2 size={23}/><div><strong>Detalhes do documento</strong><span>Preencha os campos abaixo para cadastrar.</span></div></div><div className="studio-form-grid"><label>Nome do concurso<input required minLength={3} maxLength={150} value={concurso} onChange={e=>setConcurso(e.target.value)} placeholder="Ex.: Processo Seletivo de TI"/></label><label>Cargo ou área<input required minLength={2} maxLength={150} value={cargo} onChange={e=>setCargo(e.target.value)} placeholder="Ex.: Auxiliar de TI"/></label></div><label>Documento em PDF<input required key={arquivo?'selecionado':'vazio'} type="file" accept=".pdf,application/pdf" onChange={e=>setArquivo(e.target.files?.[0]||null)}/></label><p className="studio-form-help"><ShieldCheck size={15}/> Máximo 4 MB. PDFs digitalizados sem texto não são suportados. Utilize documentos fictícios ou públicos.</p><button className="studio-primary" disabled={ocupado} type="submit">{ocupado?<LoaderCircle className="spin" size={17}/>:<FilePlus2 size={17}/>} Salvar edital <ArrowRight size={17}/></button></form></section>}
    {area==='comparador'&&<section className="studio-subpage"><div className="studio-section-heading studio-subpage-heading"><div><span className="studio-block-eyebrow">03 / ANÁLISE DOCUMENTAL</span><h1>O que mudou<br/><em>de uma versão para outra?</em></h1><p>Compare o texto de dois PDFs e encontre adições, remoções e possíveis retificações.</p></div><div className="studio-section-icon"><FileDiff size={27}/></div></div><form className="studio-data-form" onSubmit={comparar}><div className="studio-form-header"><Layers3 size={23}/><div><strong>Comparador de versões</strong><span>Adicione o documento original e a versão atualizada.</span></div></div><div className="studio-form-grid"><label>Versão anterior<input required type="file" accept=".pdf,application/pdf" onChange={e=>setAntigo(e.target.files?.[0]||null)}/></label><label>Versão atualizada<input required type="file" accept=".pdf,application/pdf" onChange={e=>setNovo(e.target.files?.[0]||null)}/></label></div><button className="studio-primary" disabled={ocupado} type="submit">{ocupado?<LoaderCircle className="spin" size={17}/>:<FileDiff size={17}/>} Comparar PDFs <ArrowRight size={17}/></button></form>{comparacao&&<div className="studio-diff"><div className="studio-diff-head"><span>RESULTADO DA COMPARAÇÃO</span><p>{comparacao.aviso}</p></div><div className="studio-form-grid"><div><h3>Adições ({comparacao.adicionadas.length})</h3>{comparacao.adicionadas.length===0?<p>Nenhuma adição detectada.</p>:comparacao.adicionadas.map((x,i)=><p key={i} className="studio-diff-line added">+ {x}</p>)}</div><div><h3>Remoções ({comparacao.removidas.length})</h3>{comparacao.removidas.length===0?<p>Nenhuma remoção detectada.</p>:comparacao.removidas.map((x,i)=><p key={i} className="studio-diff-line removed">− {x}</p>)}</div></div>{comparacao.retificacoes.length>0&&<div className="studio-retifications"><h3>Possíveis retificações</h3>{comparacao.retificacoes.map((x,i)=><p key={i}><strong>Antes:</strong> {x.antes} <strong>Depois:</strong> {x.depois}</p>)}</div>}</div>}</section>}
    <footer className="studio-footer"><span>© 2026 EDITAL.FÁCIL</span><span>TECNOLOGIA A SERVIÇO DA CLAREZA. <span className="studio-footer-dot">✳</span></span><span>Consulte sempre o documento oficial.</span></footer>
   </main>
  </div>
 </div>;
}
