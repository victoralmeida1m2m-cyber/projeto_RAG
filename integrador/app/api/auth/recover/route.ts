import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, secureEqual, validOrigin } from '@/lib/auth';
import { consumeLimit, limitKey } from '@/lib/rate-limit';
import { falha } from '@/lib/responses';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({erro:'Origem não autorizada.'},{status:403});
 try{
  if(!(await consumeLimit(limitKey(req,'recovery'),5,30)))
   return NextResponse.json({erro:'Muitas tentativas. Aguarde 30 minutos.'},{status:429});
  const json=await req.json();
  const codigo=String(json.codigo??'');
  const nova=String(json.nova??'');
  if(nova.length<12||nova.length>128||codigo.length<24||codigo.length>256)
   return NextResponse.json({erro:'Use uma nova senha de 12 a 128 caracteres e um código de recuperação válido.'},{status:400});
  const esperado=process.env.ADMIN_RECOVERY_CODE||'';
  if(esperado.length<24)return NextResponse.json({erro:'Recuperação ainda não está ativada. Configure ADMIN_RECOVERY_CODE na Vercel e publique novamente.'},{status:503});
  if(!secureEqual(esperado,codigo))return NextResponse.json({erro:'Código de recuperação inválido.'},{status:403});
  const senhaHash=await hashPassword(nova);
  const hashCodigo=createHash('md5').update(codigo).digest('hex');
  const sql=db();
  // Operação atômica: consome o código uma vez, atualiza a senha e encerra sessões existentes.
  const rows=await sql`WITH consumed AS (
    INSERT INTO admin_recovery(id,token_hash,expires_at,used_at)
    VALUES(1,${hashCodigo},NOW(),NOW())
    ON CONFLICT(id) DO UPDATE SET
     token_hash=EXCLUDED.token_hash,
     expires_at=NOW(),
     used_at=NOW()
    WHERE admin_recovery.token_hash<>EXCLUDED.token_hash
    RETURNING id
   ), updated AS (
    UPDATE admin_users SET password_hash=${senhaHash}
    WHERE singleton=1 AND EXISTS(SELECT 1 FROM consumed)
    RETURNING id,email
   ), revoked AS (
    DELETE FROM admin_sessions WHERE admin_id IN (SELECT id FROM updated) RETURNING token_hash
   ) SELECT email FROM updated`;
  if(!rows.length)return NextResponse.json({erro:'O código já foi utilizado ou a conta não foi encontrada. Crie um novo código na Vercel.'},{status:409});
  return NextResponse.json({redefinida:true,email:String(rows[0].email)},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return falha(e,'Não foi possível redefinir a senha.')}
}
