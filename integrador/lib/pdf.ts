import { extractText, getDocumentProxy } from 'unpdf';
const MAX_SIZE=4*1024*1024;
export async function lerPdf(arquivo: File): Promise<{paginas:string[];totalPaginas:number}> {
 if(arquivo.size===0||arquivo.size>MAX_SIZE) throw new Error('O PDF deve ter no máximo 4 MB.');
 const bytes=new Uint8Array(await arquivo.arrayBuffer());
 if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-') throw new Error('O arquivo não é um PDF válido.');
 const pdf=await getDocumentProxy(bytes);
 const {text,totalPages}=await extractText(pdf,{mergePages:false});
 const paginas=(Array.isArray(text)?text:[text]).map(v=>String(v??'').trim());
 if(!paginas.some(Boolean)) throw new Error('PDF sem texto extraível. Esta versão não faz OCR.');
 if(totalPages>150) throw new Error('Limite de 150 páginas por PDF nesta demonstração.');
 return {paginas,totalPaginas:totalPages};
}
export function quebrarTrechos(paginas:string[],alvo=1250) {
 const result:{pagina:number;sequencia:number;texto:string}[]=[];
 const inserir=(pagina:number,texto:string)=>{if(texto.trim()) result.push({pagina,sequencia:result.length,texto:texto.trim()})};
 paginas.forEach((pagina,i)=>{
  let buffer='';
  for(const trecho of pagina.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean)){
   if(buffer && buffer.length+trecho.length>alvo){inserir(i+1,buffer);buffer='';}
   if(trecho.length>alvo){for(let j=0;j<trecho.length;j+=alvo)inserir(i+1,trecho.slice(j,j+alvo));}
   else buffer+=(buffer?'\n\n':'')+trecho;
  }
  inserir(i+1,buffer);
 });
 return result.slice(0,1200);
}
