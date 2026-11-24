'use client';
import { useEffect,useRef,useState } from 'react';
import { ArrowUpRight, BookOpen, Check, FileDiff, FileText, Layers3, MessageSquareText, Sparkles } from 'lucide-react';

type BentoMiniCardsProps={
  libraryCount:number;
  recentDocs:string[];
  onLibrary:()=>void;
  onCompare:()=>void;
  onAssistant:()=>void;
};

/**
 * Adaptado da referência Bento Mini UI de @sajad (21st.dev).
 * As microinterfaces utilizam os nomes reais dos editais onde disponíveis.
 * As versões comparadas e o chat em miniatura são ilustrações da funcionalidade.
 * Sem imagens externas e sem dados fictícios apresentados como consultas reais.
 */
export default function BentoMiniCards({libraryCount,recentDocs,onLibrary,onCompare,onAssistant}:BentoMiniCardsProps){
 const ref=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const node=ref.current;
  if(!node)return;
  if(typeof IntersectionObserver==='undefined'){setVisible(true);return}
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect()}
  },{threshold:0.1,rootMargin:'0px 0px 65px 0px'});
  observer.observe(node);
  return ()=>observer.disconnect();
 },[]);
 const files=recentDocs.slice(0,3);
 return <div ref={ref} className={'bento-mini-grid '+(visible?'bento-mini-visible':'')}>
  <button className="bento-mini-card" type="button" onClick={onLibrary} aria-label="Abrir a biblioteca de editais">
   <div className="bento-mini-visual bento-mini-visual-files" aria-hidden="true">
    <div className="bento-mini-browser">
     <span className="bento-mini-browser-heading"><BookOpen size={14}/> Biblioteca de editais</span>
     <div className="bento-mini-browser-items">{files.length?files.map((name,i)=><span className="bento-mini-file-row" key={name+i} style={{'--bento-index':i} as React.CSSProperties}><FileText size={15}/><span>{name}</span><Check size={13}/></span>):<span className="bento-mini-file-row bento-mini-file-empty"><FileText size={15}/> Seus editais aparecerão aqui</span>}</div>
    </div>
    <span className="bento-mini-float-tag"><span className="bento-mini-tag-dot"/>{libraryCount} {libraryCount===1?'edital disponível':'editais disponíveis'}</span>
   </div>
   <div className="bento-mini-description"><span className="bento-mini-card-kicker">01 / DOCUMENTOS</span><h3>Uma biblioteca.<br/>Tudo organizado.</h3><p>Localize rapidamente os editais e abra qualquer documento publicado para consultar com IA.</p><span className="bento-mini-cta">Explorar biblioteca <ArrowUpRight size={16}/></span></div>
  </button>
  <button className="bento-mini-card" type="button" onClick={onCompare} aria-label="Abrir comparador de versões">
   <div className="bento-mini-visual bento-mini-visual-compare" aria-hidden="true">
    <span className="bento-mini-visual-label">PRÉVIA ILUSTRATIVA</span>
    <div className="bento-mini-two-docs">
     <div className="bento-mini-document bento-mini-document-before"><span><FileText size={13}/> Versão A</span><i/><i/><i/></div>
     <span className="bento-mini-compare-link"><FileDiff size={21}/></span>
     <div className="bento-mini-document bento-mini-document-after"><span><FileText size={13}/> Versão B</span><i/><i/><i className="bento-mini-line-added"/></div>
    </div>
    <span className="bento-mini-compare-result"><Layers3 size={14}/> Encontre as alterações</span>
   </div>
   <div className="bento-mini-description"><span className="bento-mini-card-kicker">02 / COMPARAÇÃO</span><h3>Cada mudança.<br/>Sem passar despercebida.</h3><p>Compare duas versões de PDF e identifique adições, remoções e possíveis retificações.</p><span className="bento-mini-cta">Comparar documentos <ArrowUpRight size={16}/></span></div>
  </button>
  <button className="bento-mini-card bento-mini-card-ai" type="button" onClick={onAssistant} aria-label="Abrir assistente de inteligência artificial">
   <div className="bento-mini-visual bento-mini-visual-ai" aria-hidden="true">
    <span className="bento-mini-visual-label">EXEMPLO DE CONSULTA</span>
    <div className="bento-mini-chat">
     <div className="bento-mini-question"><MessageSquareText size={15}/><span>Quais são os requisitos?</span></div>
     <div className="bento-mini-answer"><span className="bento-mini-ai-avatar"><Sparkles size={14}/></span><span className="bento-mini-answer-lines"><i/><i/><i/></span><span className="bento-mini-citation">Fonte [1]</span></div>
    </div>
    <span className="bento-mini-ai-glow" aria-hidden="true"/>
   </div>
   <div className="bento-mini-description"><span className="bento-mini-card-kicker">03 / ASSISTENTE IA</span><h3>Pergunte ao edital.<br/>Entenda a resposta.</h3><p>Faça perguntas com apoio do Gemini e consulte os trechos que fundamentam cada resposta.</p><span className="bento-mini-cta">Perguntar à IA <ArrowUpRight size={16}/></span></div>
  </button>
 </div>;
}
