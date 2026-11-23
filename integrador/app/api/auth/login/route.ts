import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {grantSession,validOrigin,verifyPassword} from '@/lib/auth';
import {consumeLimit,limitKey} from '@/lib/rate-limit';
import {falha} from '@/lib/responses';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não autorizada.'},{status:403});
 try{
  const data=await req.json();
  const email=String(data.email??'').trim().toLowerCase();
  const senha=String(data.senha??'');
  if(email.length>254||senha.length>128||!email||!senha)return NextResponse.json({erro:'Credenciais inválidas.'},{status:401});
  if(!(await consumeLimit(limitKey(req,'login',email),7,15)))return NextResponse.json({erro:'Muitas tentativas. Tente novamente em 15 minutos.'},{status:429});
  const sql=db();
  const rows=await sql`SELECT id,email,password_hash FROM admin_users WHERE email=${email} LIMIT 1`;
  // Mesmo se não existir a conta, mantém mensagem de erro genérica.
  if(!rows.length||!(await verifyPassword(senha,String(rows[0].password_hash))))
   return NextResponse.json({erro:'E-mail ou senha incorretos.'},{status:401});
  const resposta=NextResponse.json({autenticado:true,email},{headers:{'Cache-Control':'no-store'}});
  return await grantSession(Number(rows[0].id),resposta);
 }catch(e){return falha(e,'Falha ao realizar login.')}
}
