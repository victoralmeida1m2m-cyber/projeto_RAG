import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {expireSession,sessionFingerprint,validOrigin} from '@/lib/auth';
import {falha} from '@/lib/responses';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não autorizada.'},{status:403});
 try{
  const fp=sessionFingerprint(req);
  if(fp){const sql=db();await sql`DELETE FROM admin_sessions WHERE token_hash=${fp}`;}
  return expireSession(NextResponse.json({autenticado:false},{headers:{'Cache-Control':'no-store'}}));
 }catch(e){return falha(e,'Falha ao encerrar a sessão.')}
}
