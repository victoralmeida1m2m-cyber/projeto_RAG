import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
function clientIP(req:Request){
 // Em Vercel: cabeçalhos são fornecidos pelo proxy; não confiar em IPs vindos de formulários.
 return (req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,80);
}
export function limitKey(req:Request,purpose:string,identifier=''){
 const pepper=process.env.ADMIN_WRITE_KEY||'edital-facil';
 return createHash('sha256').update([pepper,purpose,clientIP(req),identifier.toLowerCase()].join('|')).digest('hex');
}
export function globalKey(purpose:string){
 const pepper=process.env.ADMIN_WRITE_KEY||'edital-facil';
 return createHash('sha256').update(pepper+'|global|'+purpose).digest('hex');
}
export async function consumeLimit(key:string,max:number,minutes:number):Promise<boolean>{
 const sql=db();
 const rows=await sql`INSERT INTO request_limits (chave,janela_inicio,acessos) VALUES (${key},NOW(),1)
 ON CONFLICT(chave) DO UPDATE SET
 acessos=CASE WHEN request_limits.janela_inicio<=NOW()-make_interval(mins=>${minutes}) THEN 1 ELSE request_limits.acessos+1 END,
 janela_inicio=CASE WHEN request_limits.janela_inicio<=NOW()-make_interval(mins=>${minutes}) THEN NOW() ELSE request_limits.janela_inicio END
 WHERE request_limits.janela_inicio<=NOW()-make_interval(mins=>${minutes}) OR request_limits.acessos<${max}
 RETURNING acessos`;
 return rows.length>0;
}
