import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {grantSession,hashPassword,secureEqual,validOrigin} from '@/lib/auth';
import {consumeLimit,limitKey} from '@/lib/rate-limit';
import {falha} from '@/lib/responses';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não autorizada.'},{status:403});
 try{
  if(!(await consumeLimit(limitKey(req,'setup'),6,30)))return NextResponse.json({erro:'Muitas tentativas. Tente novamente mais tarde.'},{status:429});
  const sql=db();
  const existing=await sql`SELECT EXISTS(SELECT 1 FROM admin_users) AS tem_admin`;
  if(existing[0]?.tem_admin)return NextResponse.json({erro:'A conta já foi criada. Use o login de administrador.'},{status:409});
  const data=await req.json();
  const email=String(data.email??'').trim().toLowerCase();
  const senha=String(data.senha??'');
  const chave=String(data.chave??'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||senha.length<12||senha.length>128)
   return NextResponse.json({erro:'Use um e-mail válido e senha de 12 a 128 caracteres.'},{status:400});
  const original=process.env.ADMIN_WRITE_KEY||'';
  if(original.length<16||!secureEqual(original,chave))return NextResponse.json({erro:'Código inicial inválido.'},{status:403});
  const passwordHash=await hashPassword(senha);
  const inserted=await sql`INSERT INTO admin_users(email,password_hash,singleton) VALUES(${email},${passwordHash},1) ON CONFLICT DO NOTHING RETURNING id`;
  if(!inserted.length)return NextResponse.json({erro:'Conta administrativa já cadastrada.'},{status:409});
  const resposta=NextResponse.json({autenticado:true,email,inicializado:true},{status:201,headers:{'Cache-Control':'no-store'}});
  return await grantSession(Number(inserted[0].id),resposta);
 }catch(e){return falha(e,'Não foi possível configurar o administrador.')}
}
