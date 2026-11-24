'use client';
import { useEffect,useRef,useState } from 'react';
import { ArrowUpRight,BookOpen,FileDiff,FilePlus2,Sparkles } from 'lucide-react';
type NavId='assistente'|'biblioteca'|'comparador'|'cadastro';
type NavItem={id:NavId;nome:string;numero:string};
const icons={assistente:Sparkles,biblioteca:BookOpen,comparador:FileDiff,cadastro:FilePlus2};
export default function ScribbleNav({items,value,onSelect}:{items:NavItem[];value:NavId;onSelect:(id:NavId)=>void}){
 const root=useRef<HTMLElement>(null);
 const buttons=useRef<Partial<Record<NavId,HTMLButtonElement|null>>>({});
 const [hovered,setHovered]=useState<NavId|null>(null);
 const [stroke,setStroke]=useState('');
 const selected=hovered??value;
 useEffect(()=>{
  const draw=()=>{
   const node=buttons.current[selected],nav=root.current;
   if(!node||!nav)return;
   const x=node.offsetLeft+2,y=node.offsetTop+3,w=node.offsetWidth-4,h=node.offsetHeight-6;
   // Loop desenhado à mão: leve assimetria e curva de saída, adaptado à referência Originkit.
   setStroke('M '+(x+24)+' '+(y+2)+' C '+(x+6)+' '+(y-3)+', '+(x-4)+' '+(y+8)+', '+(x+2)+' '+(y+h*.53)+
   ' C '+(x+4)+' '+(y+h+6)+', '+(x+w*.30)+' '+(y+h+4)+', '+(x+w*.70)+' '+(y+h+2)+
   ' C '+(x+w+9)+' '+(y+h+1)+', '+(x+w+9)+' '+(y+h*.39)+', '+(x+w-1)+' '+(y+11)+
   ' C '+(x+w-10)+' '+(y-5)+', '+(x+w*.38)+' '+(y-1)+', '+(x+24)+' '+(y+2));
  };
  draw();const ro=new ResizeObserver(draw);if(root.current)ro.observe(root.current);
  window.addEventListener('resize',draw);return ()=>{ro.disconnect();window.removeEventListener('resize',draw)};
 },[selected,items.length]);
 return <nav ref={root} className="studio-nav-list" aria-label="Ferramentas do Edital Fácil" onMouseLeave={()=>setHovered(null)}>
  <svg key={selected} className="studio-scribble" aria-hidden="true"><path d={stroke} fill="none" stroke="#c9fa7a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
  {items.map(item=>{const Icon=icons[item.id];return <button key={item.id} type="button" ref={el=>{buttons.current[item.id]=el}} className={'studio-nav-link '+(value===item.id?'is-active':'')} aria-pressed={value===item.id} onMouseEnter={()=>setHovered(item.id)} onFocus={()=>setHovered(item.id)} onBlur={()=>setHovered(null)} onClick={()=>onSelect(item.id)}>
   <span className="studio-nav-icon"><Icon size={18}/></span><span className="studio-nav-name">{item.nome}</span><ArrowUpRight size={15} className="studio-nav-arrow"/>
  </button>})}
 </nav>;
}