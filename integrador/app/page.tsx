'use client';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, FileDiff, FilePlus2, FileSearch, LoaderCircle, LockKeyhole, RefreshCcw, ShieldCheck, Trash2 } from 'lucide-react';
type Guia='biblioteca'|'cadastro'|'assistente'|'comparador';
type Edital={id:string;concurso:string;cargo:string;nome_arquivo:string;status:string;total_paginas:number;total_trechos:number};
type Fonte={numero:number;pagina:number;texto:string};
const areas:{id:Guia;nome:string;numero:string}[]=[
 {id:'biblioteca',nome:'Biblioteca',numero:'01'},
 {id:'cadastro',nome:'Cadastrar edital',numero:'02'},
 {id:'assistente',nome:'Assistente IA',numero:'03'},
 {id:'comparador',nome:'Comparar versões',numero:'04'}
];
export default function Home(){
 const [area,setArea]=useState<Guia>('biblioteca');
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
 const carregar=useCallback(async()=>{
   try{
    const res=await fetch('/api/editais',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw new Error(data.erro||'Falha ao consultar o banco de dados.');
    setEditais(data.editais||[]);
    setSelecionado(atual=>atual||(data.editais?.[0]?.id?String(data.editais[0].id):''));
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
 return <div className="app-shell">
  <header className="topbar"><a className="wordmark" href="/" aria-label="Edital Fácil, início">edital<span>.fácil</span><small> / INTEGRADOR PIT</small></a><a className="outline-btn" href="/admin">{isAdmin?'Minha conta':'Entrar como administrador'} <ArrowRight size={14}/></a></header>
  <div className="workspace">
   <aside className="sidebar">
    <div className="sidebar-heading">NAVEGAÇÃO <span>{isAdmin?'4':'3'} ÁREAS</span></div>
    <nav aria-label="Áreas do projeto">{areas.filter(a=>a.id!=='cadastro'||isAdmin).map(a=><button key={a.id} className={'nav-item '+(area===a.id?'active':'')} onClick={()=>{setArea(a.id);preparar()}}><span className="nav-number">{a.numero}</span>{a.nome}<ArrowRight size={15}/></button>)}</nav>
    <div className="sidebar-note"><ShieldCheck size={18}/><p>Os dados são armazenados no Neon. As respostas da IA são apenas informativas: confirme sempre no edital oficial.</p></div>
   </aside>
   <main className="main-content">
    <div className="eyebrow"><span className="dot"/> PROJETO INTEGRADOR <span className="line"/> REACT + SQL + IA</div>
    <h1>EDITAIS MAIS <br/><em>FÁCEIS DE ENTENDER.</em></h1>
    <p className="lead">Central inteligente para registrar editais, localizar informações com IA e identificar mudanças em documentos.</p>
    <div className="member-bar"><div className="role"><ShieldCheck size={20}/><span>{isAdmin?'Administrador autenticado: você pode gerenciar os editais.':authChecked?'Acesso de visitante: consulte editais e use até 3 perguntas por 24 horas.':'Verificando acesso...'}</span></div><a href="/admin">{isAdmin?'Gerenciar minha conta':'Acessar administração'} <ArrowRight size={14}/></a></div>
    {erro&&<div className="notice error" role="alert">{erro}</div>}
    {status&&<div className="notice success" role="status"><CheckCircle2 size={18}/>{status}</div>}
    {area==='biblioteca'&&<section>
      <div className="section-heading"><div><span className="section-label">01 / ACERVO DIGITAL</span><h2>Biblioteca de editais</h2><p>Registros reais persistidos no PostgreSQL do Neon.</p></div><button className="outline-btn" onClick={()=>{setCarregando(true);void carregar()}}><RefreshCcw size={16}/> Atualizar</button></div>
      {carregando?<p className="empty">Consultando banco de dados...</p>:editais.length===0?<div className="empty"><BookOpen size={30}/><h3>Nenhum edital cadastrado</h3><p>Cadastre seu primeiro documento e atualize a página para verificar a persistência.</p>{isAdmin?<button className="action" onClick={()=>setArea('cadastro')}>Cadastrar edital <ArrowRight size={17}/></button>:<a className="action" href="/admin">Entrar para cadastrar <ArrowRight size={17}/></a>}</div>:<div className="cards">{editais.map(e=><article className="edital-card" key={e.id}><div className="card-top"><span>DOC. {String(e.id).padStart(3,'0')}</span><span className={'state '+(e.status==='publicado'?'published':'')}>{e.status}</span></div><h3>{e.concurso}</h3><p>{e.cargo}</p><div className="meta"><span>{e.total_paginas} páginas</span><span>{e.total_trechos} trechos</span></div><p className="filename">{e.nome_arquivo}</p><div className="card-actions"><button disabled={ocupado} onClick={()=>{setSelecionado(String(e.id));setArea('assistente');preparar()}}>Consultar IA <ArrowRight size={14}/></button>{isAdmin&&<button disabled={ocupado} onClick={()=>mudar(e,e.status==='publicado'?'arquivar':'publicar')}>{e.status==='publicado'?'Arquivar':'Publicar'}</button>}{isAdmin&&<button className="danger" disabled={ocupado} title="Excluir" aria-label={'Excluir '+e.concurso} onClick={()=>mudar(e,'remover')}><Trash2 size={15}/></button>}</div></article>)}</div>}
     </section>}
    {area==='cadastro'&&isAdmin&&<section><div className="section-heading"><div><span className="section-label">02 / PERSISTÊNCIA DOCUMENTAL</span><h2>Cadastrar edital</h2><p>Envie um PDF: o servidor extrai o texto e salva os trechos relacionados ao edital.</p></div><FilePlus2 size={31}/></div><form className="form-card" onSubmit={salvar}><div className="form-grid"><label>Concurso<input required minLength={3} maxLength={150} value={concurso} onChange={e=>setConcurso(e.target.value)} placeholder="Ex.: Prefeitura Municipal (fictício)"/></label><label>Cargo<input required minLength={2} maxLength={150} value={cargo} onChange={e=>setCargo(e.target.value)} placeholder="Ex.: Técnico em TI (fictício)"/></label></div><label>Arquivo PDF — máximo 4 MB<input required type="file" accept=".pdf,application/pdf" onChange={e=>setArquivo(e.target.files?.[0]||null)}/></label><p className="helper">Utilize apenas documentos de demonstração ou dados públicos. PDFs digitalizados sem texto exigem OCR e não são suportados.</p><button className="action" disabled={ocupado||!isAdmin}>{ocupado?<LoaderCircle className="spin" size={17}/>:<FilePlus2 size={17}/>} Salvar edital no Neon</button></form></section>}
    {area==='assistente'&&<section><div className="section-heading"><div><span className="section-label">03 / IA CONTEXTUAL</span><h2>Converse com seu edital</h2><p>Busca textual no PostgreSQL e resposta do Grok com referências numeradas. Visitantes: até 3 perguntas por 24 horas.</p></div><FileSearch size={31}/></div><form className="form-card" onSubmit={perguntar}><label>Documento selecionado<select required value={selecionado} onChange={e=>setSelecionado(e.target.value)}>{editais.length===0&&<option value="">Cadastre um edital primeiro</option>}{editais.filter(e=>e.status==='publicado').map(e=><option key={e.id} value={String(e.id)}>{e.concurso} — {e.cargo}</option>)}</select></label><label>Sua pergunta<textarea required minLength={5} maxLength={600} rows={4} value={pergunta} onChange={e=>setPergunta(e.target.value)} placeholder="Ex.: Quais são os requisitos para o cargo?"/></label><button className="action" disabled={ocupado||!selecionado}>{ocupado?<LoaderCircle className="spin" size={17}/>:<ArrowRight size={17}/>} Consultar Grok</button></form>{resposta&&<div className="answer"><span className="section-label">RESPOSTA GERADA COM CONTEXTO</span><p>{resposta}</p>{fontes.length>0&&<details><summary>Fontes recuperadas ({fontes.length})</summary>{fontes.map(f=><div className="source" key={f.numero}><strong>[{f.numero}] Página {f.pagina}</strong><p>{f.texto}</p></div>)}</details>}</div>}</section>}
    {area==='comparador'&&<section><div className="section-heading"><div><span className="section-label">04 / COMPARAÇÃO DE VERSÕES</span><h2>O que mudou?</h2><p>Compare dois PDFs e examine adições, remoções e possíveis retificações.</p></div><FileDiff size={31}/></div><form className="form-card" onSubmit={comparar}><div className="form-grid"><label>Versão original<input type="file" accept=".pdf,application/pdf" required onChange={e=>setAntigo(e.target.files?.[0]||null)}/></label><label>Versão atualizada<input type="file" accept=".pdf,application/pdf" required onChange={e=>setNovo(e.target.files?.[0]||null)}/></label></div><button className="action" disabled={ocupado}>{ocupado?<LoaderCircle className="spin" size={17}/>:<FileDiff size={17}/>} Comparar arquivos</button></form>{comparacao&&<div className="comparison"><p className="helper">{comparacao.aviso}</p><div className="form-grid"><article><h3>Adições ({comparacao.adicionadas.length})</h3>{comparacao.adicionadas.length===0?<p>Nenhuma detectada.</p>:comparacao.adicionadas.map((x,i)=><p key={i} className="diff-line add">+ {x}</p>)}</article><article><h3>Remoções ({comparacao.removidas.length})</h3>{comparacao.removidas.length===0?<p>Nenhuma detectada.</p>:comparacao.removidas.map((x,i)=><p key={i} className="diff-line remove">− {x}</p>)}</article></div>{comparacao.retificacoes.length>0&&<div className="retifications"><h3>Possíveis retificações</h3>{comparacao.retificacoes.map((x,i)=><p key={i}><strong>Onde se lê:</strong> {x.antes} <strong>Leia-se:</strong> {x.depois}</p>)}</div>}</div>}</section>}
    <footer className="footer"><span>EDITAL.FÁCIL / PIT 2026</span><span>PROJETO EDUCACIONAL • USE EDITAIS FICTÍCIOS</span></footer>
   </main>
  </div>
 </div>
}
