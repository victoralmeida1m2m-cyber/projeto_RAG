import type { ReactNode } from 'react';

/** Logo SVG adaptada da segunda opção escolhida: páginas em camadas que se unem e recebem o check. */
export default function AnimatedLogo({adminSuffix}:{adminSuffix?:ReactNode}){
 return <span className="edital-brand-lockup">
  <svg className="edital-brand-mark" viewBox="0 0 144 152" width="68" height="74" fill="none" aria-hidden="true" focusable="false">
   <defs>
    <linearGradient id="brand-front-gradient" x1="72" y1="47" x2="138" y2="146" gradientUnits="userSpaceOnUse">
     <stop stopColor="#C7FA60"/><stop offset="1" stopColor="#7BC61A"/>
    </linearGradient>
   </defs>
   <g className="edital-brand-sheet edital-brand-sheet-back">
    <path d="M14 47 Q14 37 24 32 L79 7 Q88 3 91 11 Q92 13 92 19 L92 110 Q62 108 14 133 Z" fill="#F2F8EF"/>
    <path d="M14 47 Q14 37 24 32 L79 7 Q88 3 91 11" stroke="#FFF" strokeWidth="2.4" strokeLinecap="round"/>
   </g>
   <g className="edital-brand-sheet edital-brand-sheet-middle">
    <path d="M36 59 Q36 47 45 42 L99 16 Q109 12 112 22 L112 118 Q77 111 36 137 Z" fill="#CDDBCA"/>
    <path d="M36 59 Q36 47 45 42 L99 16 Q109 12 112 22" stroke="#F9FFF5" strokeWidth="2" strokeLinecap="round"/>
   </g>
   <g className="edital-brand-sheet edital-brand-sheet-front">
    <path d="M65 66 Q65 58 73 54 L127 28 Q137 23 137 34 L137 117 Q137 123 130 127 L65 151 Z" fill="url(#brand-front-gradient)"/>
    <path d="M65 66 Q65 58 73 54 L127 28 Q137 23 137 34" stroke="#E1FF98" strokeWidth="2.2" strokeLinecap="round"/>
   </g>
   <path className="edital-brand-check" d="M81 96 L96 110 L120 77" stroke="#FFF" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  <span className="edital-brand-identity">
   <span className="edital-brand-name"><span>Edital</span><span className="edital-brand-accent">Fácil</span></span>
   <span className="edital-brand-underline" aria-hidden="true"/>
   {adminSuffix&&<small className="edital-brand-context">{adminSuffix}</small>}
  </span>
 </span>;
}
