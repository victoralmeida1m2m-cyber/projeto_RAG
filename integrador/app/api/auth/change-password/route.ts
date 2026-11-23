import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {currentAdmin,hashPassword,sessionFingerprint,validOrigin,verifyPassword} from '@/lib/auth';
import {consumeLimit,limitKey} from '@/lib/rate-limit';
import {falha} from '@/lib/responses';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não autorizada.'},{status:403});
 try{
  const admin=await currentAdmin(req);
  if(!admin)return NextResponse.json({erro:'Faça login para continuar.'},{status:401});
  if(!(await consumeLimit(limitKey(req,'change-password',String(admin.id)),6,30)))return NextResponse.json({erro:'Muitas tentativas de alteração de senha.'},{status:429});
  const data=await req.json();
  const atual=String(data.atual??''),nova=String(data.nova??'');
  if(nova.length<12||nova.length>128||atual.length>128)
   return NextResponse.json({erro:'A nova senha precisa de 12 a 128 caracteres.'},{status:400});
  const sql=db();
  const rows=await sql`SELECT password_hash FROM admin_users WHERE id=${admin.id} LIMIT 1`;
  if(!rows.length||!(await verifyPassword(atual,String(rows[0].password_hash))))
   return NextResponse.json({erro:'Senha atual incorreta.'},{status:403});
  const hash=await hashPassword(nova);
  await sql`UPDATE admin_users SET password_hash=${hash} WHERE id=${admin.id}`;
  const current=sessionFingerprint(req);
  await sql`DELETE FROM admin_sessions WHERE admin_id=${admin.id} AND token_hash<>${current||''}`;
  return NextResponse.json({alterada:true});
 }catch(e){return falha(e,'Falha ao alterar a senha.')}
}
