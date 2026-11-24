'use client';
import { useEffect,useState } from 'react';
import type { ButtonHTMLAttributes,ReactNode } from 'react';
import { ArrowRight, Check, LoaderCircle, Sparkles } from 'lucide-react';

type InteractiveHoverButtonProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'> & {
 label:string;
 loading?:boolean;
 success?:boolean;
 loadingText?:string;
 successText?:string;
 variant?:'primary'|'secondary'|'quiet';
 icon?:ReactNode;
 compact?:boolean;
};

/**
 * Botão adaptado da referência Interactive Hover Button (@Shatlyk1011 / emerald-ui).
 * O efeito de expansão do ponto é CSS; os estados loading e success vêm da
 * operação real, não de timers de sucesso simulados como no componente-demo.
 */
export default function InteractiveHoverButton({
 label,loading=false,success=false,loadingText='Processando...',successText='Concluído',
 variant='primary',icon,compact=false,type='button',className='',disabled,...props
}:InteractiveHoverButtonProps){
 const [justSucceeded,setJustSucceeded]=useState(false);
 useEffect(()=>{
  if(!success){setJustSucceeded(false);return}
  setJustSucceeded(true);
  const timeout=setTimeout(()=>setJustSucceeded(false),2000);
  return ()=>clearTimeout(timeout);
 },[success]);
 const state=loading?'loading':justSucceeded?'success':'idle';
 const text=state==='loading'?loadingText:state==='success'?successText:label;
 const currentIcon=state==='loading'?<LoaderCircle size={16} className="spin"/>:
   state==='success'?<Check size={17}/>:icon??<Sparkles size={17}/>;
 return <button {...props} type={type} disabled={disabled||loading}
  data-status={state}
  className={'interactive-hover-btn interactive-hover-btn--'+variant+(compact?' interactive-hover-btn--compact':'')+' '+className}>
  <span className="interactive-hover-dot" aria-hidden="true"/>
  <span className="interactive-hover-main">{currentIcon}<span>{text}</span>{state==='idle'&&<ArrowRight size={16} className="interactive-hover-main-arrow"/>}</span>
  <span className="interactive-hover-reveal" aria-hidden="true">{icon??<Sparkles size={17}/>}<span>{label}</span><ArrowRight size={16}/></span>
 </button>;
}
