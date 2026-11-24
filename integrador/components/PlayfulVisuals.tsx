'use client';

import { ArrowUpRight, BookOpen, Check, FileDiff, FileText, FolderOpen, Search, Sparkles } from 'lucide-react';

type ActionCardsProps={
 onAssistant:()=>void;
 onLibrary:()=>void;
 onCompare:()=>void;
};
type ResourceCardsProps={onAssistant:()=>void;onLibrary:()=>void;onCompare:()=>void};

/* Ilustrações SVG originais. O desenho traduz a referência enviada
   sem incorporar a captura nem reproduzir marcas de terceiros. */
export function MascotIllustration(){
 return <svg className="play-mascot-svg" viewBox="0 0 500 505" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
   <linearGradient id="hood" x1="220" y1="275" x2="400" y2="454" gradientUnits="userSpaceOnUse"><stop stopColor="#932FFF"/><stop offset="1" stopColor="#4B15B1"/></linearGradient>
   <linearGradient id="skin" x1="220" y1="100" x2="334" y2="279" gradientUnits="userSpaceOnUse"><stop stopColor="#FFC27B"/><stop offset="1" stopColor="#F58D5B"/></linearGradient>
   <linearGradient id="speech" x1="83" y1="35" x2="240" y2="128"><stop stopColor="#3CD0FF"/><stop offset="1" stopColor="#008CDA"/></linearGradient>
  </defs>
  <path d="M118 46C130 15 187 7 228 32c21 13 27 47 12 69-9 12-27 14-43 13l-15 23-7-24c-45-3-72-25-57-67Z" fill="url(#speech)" stroke="#060815" strokeWidth="7" strokeLinejoin="round"/>
  <text x="176" y="62" textAnchor="middle" fontSize="18" fontWeight="900" fill="#071523" transform="rotate(-8 176 62)">BORA</text>
  <text x="177" y="85" textAnchor="middle" fontSize="17" fontWeight="900" fill="#071523" transform="rotate(-8 177 85)">ENTENDER!</text>
  <path d="m418 60 6 19 20 2-17 12 5 18-17-11-18 9 7-20-14-12 19 1 9-18Z" fill="#D5FC27" stroke="#111020" strokeWidth="5" strokeLinejoin="round"/>
  <path d="m76 205-9 18-21-3 14 16-9 17 20-10 14 13-3-21 18-8-21-4-3-18Z" fill="#FFBC2B" stroke="#101019" strokeWidth="5"/>
  <path d="M351 100c28-53 91-35 104 4 32 0 46 33 27 54 24 28 3 56-24 53 1 28-35 44-59 24-24 28-60 11-61-14-30 3-49-26-31-48-23-33 2-58 44-73Z" fill="#110D1E" stroke="#7031D4" strokeWidth="7" strokeLinejoin="round"/>
  <path d="M362 109c13-23 35-26 49-16M418 110c14 0 25 11 26 22M449 160c11 7 15 17 10 28" stroke="#A659F1" strokeWidth="6" strokeLinecap="round"/>
  <path d="M245 110c4-39 39-65 70-56 16-23 49-20 61 0 27-13 53 7 46 31 20 8 20 32-1 42 8 34-17 53-40 41-10 19-39 21-53 5-37 17-71 1-83-28-25-6-31-30 0-35Z" fill="#0F0E1A" stroke="#5C28B0" strokeWidth="6"/>
  <path d="M294 117c-6-24 9-39 29-45M349 67c14-5 27 0 34 9M255 134c-5 19 1 33 15 39" stroke="#713AD1" strokeWidth="6" strokeLinecap="round"/>
  <ellipse cx="334" cy="202" rx="92" ry="106" fill="url(#skin)" stroke="#110E1C" strokeWidth="8"/>
  <path d="M244 161c7-53 40-75 79-72 38-10 69 11 81 39-17-7-34-6-46-19-16 22-37 16-57 9-12 22-35 31-57 43Z" fill="#110E1C"/>
  <path d="M284 170c10-10 23-10 34-1M363 169c12-12 24-10 35-1" stroke="#19111A" strokeWidth="7" strokeLinecap="round"/>
  <ellipse cx="305" cy="188" rx="7" ry="13" fill="#1C1015"/><ellipse cx="378" cy="186" rx="7" ry="13" fill="#1C1015"/>
  <ellipse cx="307" cy="185" rx="2" ry="4" fill="white"/><ellipse cx="380" cy="183" rx="2" ry="4" fill="white"/>
  <path d="M345 189c-5 10-7 18 0 21" stroke="#D77555" strokeWidth="4" strokeLinecap="round"/>
  <path d="M305 235c17 27 52 29 73 0-22 7-48 8-73 0Z" fill="#270C18" stroke="#270C18" strokeWidth="4" strokeLinejoin="round"/>
  <path d="M319 241c14 8 30 8 46 0" stroke="#FFF5DB" strokeWidth="10" strokeLinecap="round"/>
  <ellipse cx="282" cy="217" rx="15" ry="9" fill="#FF687B" opacity=".54"/><ellipse cx="392" cy="212" rx="13" ry="9" fill="#FF687B" opacity=".55"/>
  <path d="M320 296c-33-15-71-9-104 14-19 14-32 40-34 81l-7 71h252l-10-90c-5-50-32-76-97-76Z" fill="url(#hood)" stroke="#0A0716" strokeWidth="8" strokeLinejoin="round"/>
  <path d="M276 285c10 33 30 53 50 60 31-13 45-31 51-58-22-6-35-3-52 10-16-16-31-17-49-12Z" fill="#B762FF" stroke="#100A1A" strokeWidth="7"/>
  <path d="M300 342c-10 47 1 93 8 118M362 341c8 53 4 85-3 118" stroke="#C078FF" strokeWidth="6" strokeLinecap="round"/>
  <path d="M315 338v40M353 338v40" stroke="#26114B" strokeWidth="5" strokeLinecap="round"/>
  <path d="M310 368v19M351 367v21" stroke="#D4FF36" strokeWidth="6" strokeLinecap="round"/>
  <path d="M210 328c-33-15-58-7-69 9-19 24-27 38-39 50 6 24 34 29 49 16 15 4 26-11 24-26l33-15" fill="#F5A269" stroke="#110C18" strokeWidth="7" strokeLinejoin="round"/>
  <path d="M127 382c-1-17-2-29-7-44M147 389c7-16 6-34 6-43M163 375c7-11 13-23 14-36" stroke="#110C18" strokeWidth="5" strokeLinecap="round"/>
  <path d="M204 345c-10 20-16 41-13 61" stroke="#6021C6" strokeWidth="13" strokeLinecap="round"/>
  <g transform="rotate(-9 284 354)">
   <rect x="221" y="296" width="133" height="148" rx="8" fill="#F2F3EF" stroke="#10101A" strokeWidth="7"/>
   <path d="M236 298v-18h83l24 24" fill="#C1E7FB" stroke="#10101A" strokeWidth="5"/>
   <path d="m320 281 3 24 21-1" fill="#B7DDF1" stroke="#10101A" strokeWidth="4"/>
   <text x="287" y="341" fontSize="27" fontWeight="950" textAnchor="middle" fill="#39276B">EDITAL</text>
   <path d="M241 355h93M244 370h74M246 385h86" stroke="#2A2952" strokeWidth="6" strokeLinecap="round"/>
   <path d="m262 404 17 14 26-28" stroke="#CBFC25" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  <path d="M358 354c25-9 46-4 59 8 16 16 16 41-1 49l-34 5-19-34" fill="#F6A469" stroke="#120C19" strokeWidth="7" strokeLinejoin="round"/>
  <path d="M399 364c5 10 7 21 5 31" stroke="#D47B55" strokeWidth="4" strokeLinecap="round"/>
  <path d="M404 432h82l-24-77H359l18 77h27Z" fill="#222538" stroke="#070A16" strokeWidth="7" strokeLinejoin="round"/>
  <path d="m402 391 13 12 18-26" stroke="#C9FF22" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M347 432h144" stroke="#0F111D" strokeWidth="9" strokeLinecap="round"/>
  <path d="m105 85 14 11-9 12M91 116l-15 6M95 69l-8-15" stroke="#D5FD38" strokeWidth="6" strokeLinecap="round"/>
  <path d="m462 274 10-11 8 12M456 294l17 6" stroke="#35BDF6" strokeWidth="6" strokeLinecap="round"/>
  <circle cx="113" cy="290" r="7" fill="#38CFFF"/><circle cx="465" cy="244" r="5" fill="#C8FB2D"/>
 </svg>;
}

function RobotArt(){
 return <svg viewBox="0 0 170 160" aria-hidden="true" className="play-card-svg" fill="none">
  <path d="M18 136c22-38 104-43 132-4" fill="#5A1CB2" stroke="#100D21" strokeWidth="6" strokeLinecap="round"/>
  <path d="m82 31 1-19m-10 0h20" stroke="#C8FF2F" strokeWidth="6" strokeLinecap="round"/>
  <circle cx="83" cy="9" r="8" fill="#D8FA29" stroke="#130B24" strokeWidth="5"/>
  <rect x="18" y="37" width="136" height="99" rx="31" fill="#F1EEFF" stroke="#100921" strokeWidth="9"/>
  <rect x="31" y="51" width="111" height="70" rx="22" fill="#102742" stroke="#160A29" strokeWidth="5"/>
  <ellipse cx="56" cy="84" rx="12" ry="16" fill="#25D7FF"/><ellipse cx="115" cy="84" rx="12" ry="16" fill="#25D7FF"/>
  <ellipse cx="59" cy="81" rx="4" ry="7" fill="#F0FDFF"/><ellipse cx="118" cy="81" rx="4" ry="7" fill="#F0FDFF"/>
  <path d="M72 102c10 10 21 10 31 0" stroke="#B6FF31" strokeWidth="5" strokeLinecap="round"/>
  <path d="M18 83H6v22l12 4m136-26h12v22l-12 4" fill="#64D5FF" stroke="#100921" strokeWidth="6" strokeLinejoin="round"/>
  <path d="M68 139h32" stroke="#C9FB2A" strokeWidth="10" strokeLinecap="round"/>
  <path d="m10 25 8-7m-7 0 8 8M145 17l6 9 9-6" stroke="#FCE252" strokeWidth="5" strokeLinecap="round"/>
 </svg>
}
function BooksArt(){
 return <svg viewBox="0 0 170 160" className="play-card-svg" aria-hidden="true" fill="none">
  <path d="M27 126 137 119l3 24-108 8-11-11 6-14Z" fill="#D8FF21" stroke="#0B0D26" strokeWidth="7" strokeLinejoin="round"/>
  <path d="m31 127 9 11-4 12" stroke="#0C0D26" strokeWidth="6"/><path d="m54 136 63-5" stroke="#679D11" strokeWidth="3"/>
  <path d="M19 86 132 71l10 33-107 17-17-15 1-20Z" fill="#8F3DFF" stroke="#0C0D26" strokeWidth="7" strokeLinejoin="round"/>
  <path d="m18 88 21 14-4 19" stroke="#0C0D26" strokeWidth="5"/><path d="m52 101 66-11" stroke="#CDB3FF" strokeWidth="3"/>
  <path d="m30 37 104-7 7 31-111 9-9-16 9-17Z" fill="#F9F8FF" stroke="#0B0D26" strokeWidth="7" strokeLinejoin="round"/>
  <path d="m30 36 7 20-7 14" stroke="#0C0D26" strokeWidth="5"/><path d="m46 52 65-4" stroke="#9CA4CB" strokeWidth="3"/>
  <path d="m153 32 7-13m-1 28 10-5" stroke="#E5FD34" strokeWidth="5" strokeLinecap="round"/>
  <path d="m3 96 6 7m-5 13 6-3" stroke="#3EF0FD" strokeWidth="5" strokeLinecap="round"/>
 </svg>
}
function CompareArt(){
 return <svg viewBox="0 0 170 160" className="play-card-svg" aria-hidden="true" fill="none">
  <g transform="rotate(-9 62 78)"><rect x="18" y="21" width="73" height="112" rx="8" fill="#FBF9F1" stroke="#091421" strokeWidth="7"/><path d="M32 51h39M32 66h44M32 81h29M32 97h35" stroke="#1A3141" strokeWidth="5" strokeLinecap="round"/></g>
  <g transform="rotate(8 111 79)"><rect x="83" y="22" width="71" height="114" rx="8" fill="#FAFBF8" stroke="#061C1B" strokeWidth="7"/><path d="M96 49h43M96 65h31M96 83h40M96 100h26" stroke="#1B3B44" strokeWidth="5" strokeLinecap="round"/></g>
  <path d="m56 133 17 13 18-14M109 19l-17-11-17 12" stroke="#D7FC2A" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="m157 129 9-8m-4 21 7 2M8 16 5 4" stroke="#FFD548" strokeWidth="5" strokeLinecap="round"/>
 </svg>
}

export function PlayfulActionCards({onAssistant,onLibrary,onCompare}:ActionCardsProps){
 const cards=[
  {key:'assistant',label:'ASSISTENTE IA',description:'Tire dúvidas sobre requisitos, prazos e regras com respostas baseadas no edital.',action:onAssistant,art:<RobotArt/>},
  {key:'library',label:'BIBLIOTECA DE EDITAIS',description:'Acesse seus documentos publicados e encontre o edital certo.',action:onLibrary,art:<BooksArt/>},
  {key:'compare',label:'COMPARADOR DE VERSÕES',description:'Veja adições, remoções e mudanças entre dois PDFs.',action:onCompare,art:<CompareArt/>},
 ];
 return <div className="play-actions" aria-label="Ferramentas principais">
  {cards.map(c=><button type="button" key={c.key} onClick={c.action} className={'play-action-card play-action-'+c.key}>
    <span className="play-action-squiggle" aria-hidden="true">✳</span>
    <span className="play-action-art">{c.art}</span>
    <span className="play-action-details"><strong>{c.label}</strong><span>{c.description}</span></span>
    <span className="play-action-arrow" aria-hidden="true"><ArrowUpRight size={20}/></span>
   </button>)}
 </div>;
}

const resources=[
 {key:'sources',title:'RESPOSTAS COM FONTES',text:'Veja os trechos utilizados pela IA.',icon:FileText,bg:'purple'},
 {key:'search',title:'BUSCA INTELIGENTE',text:'Encontre informações no edital.',icon:Search,bg:'blue'},
 {key:'compare',title:'COMPARAÇÃO DE VERSÕES',text:'Identifique o que mudou.',icon:FileDiff,bg:'yellow'},
 {key:'files',title:'DOCUMENTOS ORGANIZADOS',text:'Consulte sua biblioteca.',icon:FolderOpen,bg:'green'},
] as const;
export function PlayfulResourceGrid({onAssistant,onLibrary,onCompare}:ResourceCardsProps){
 const actions=[onAssistant,onAssistant,onCompare,onLibrary];
 return <div className="play-resource-grid">
  {resources.map((resource,i)=>{
   const Icon=resource.icon;
   return <button className={'play-resource-card play-resource-'+resource.bg} type="button" onClick={actions[i]} key={resource.key}>
    <span className="play-resource-icon" aria-hidden="true"><Icon size={40} strokeWidth={2.6}/><span className="play-resource-sticker"><Check size={15} strokeWidth={3}/></span></span>
    <span className="play-resource-body"><strong>{resource.title}</strong><span>{resource.text}</span></span>
    <ArrowUpRight size={15} className="play-resource-arrow" aria-hidden="true"/>
   </button>;
  })}
 </div>;
}
