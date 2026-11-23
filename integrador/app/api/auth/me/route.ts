import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {currentAdmin} from '@/lib/auth';
import {falha} from '@/lib/responses';
export const runtime='nodejs';
export async function GET(req:Request){
 try{
  const sql=db();
  const [admin,rows]=await Promise.all([currentAdmin(req),sql`SELECT EXISTS(SELECT 1 FROM admin_users) AS inicializado`]);
  return NextResponse.json({autenticado:!!admin,email:admin?.email??null,inicializado:Boolean(rows[0]?.inicializado)},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return falha(e,'Não foi possível verificar a conta administrativa.')}
}
