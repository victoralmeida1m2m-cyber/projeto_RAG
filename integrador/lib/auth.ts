import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
const scrypt=promisify(scryptCb);
export const COOKIE='ef_admin';
export const SESSION_SECONDS=12*60*60;
function hash(s:string){return createHash('sha256').update(s).digest('hex')}
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString('hex');
 const derived=await scrypt(password,Buffer.from(salt,'hex'),64) as Buffer;
 return 'scrypt$'+salt+'$'+derived.toString('hex');
}
export async function verifyPassword(password:string,encoded:string){
 const parts=encoded.split('$');
 if(parts.length!==3||parts[0]!=='scrypt'||!/^[0-9a-f]{32}$/.test(parts[1])||!/^[0-9a-f]{128}$/.test(parts[2]))return false;
 const real=Buffer.from(parts[2],'hex');
 const attempt=await scrypt(password,Buffer.from(parts[1],'hex'),real.length) as Buffer;
 return timingSafeEqual(real,attempt);
}
function sessionToken(req:Request){
 const cookie=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
 const token=cookie?.slice(COOKIE.length+1);
 return token && /^[a-f0-9]{64}$/.test(token)?token:null;
}
export async function currentAdmin(req:Request):Promise<{id:number;email:string}|null>{
 const token=sessionToken(req);
 if(!token)return null;
 const sql=db();
 const fingerprint=hash(token);
 const rows=await sql`SELECT a.id,a.email FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_id WHERE s.token_hash=${fingerprint} AND s.expira_em>NOW() LIMIT 1`;
 return rows.length?{id:Number(rows[0].id),email:String(rows[0].email)}:null;
}
export function sessionFingerprint(req:Request){const token=sessionToken(req);return token?hash(token):null}
export async function grantSession(adminId:number,res:NextResponse){
 const token=randomBytes(32).toString('hex');
 const fingerprint=hash(token);
 const sql=db();
 await sql`INSERT INTO admin_sessions(token_hash,admin_id,expira_em) VALUES(${fingerprint},${adminId},NOW()+INTERVAL '12 hours')`;
 res.cookies.set({name:COOKIE,value:token,httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:SESSION_SECONDS});
 return res;
}
export function expireSession(res:NextResponse){
 res.cookies.set({name:COOKIE,value:'',httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});
 return res;
}
export function validOrigin(req:Request){
 const origin=req.headers.get('origin');
 return !origin||origin===new URL(req.url).origin;
}
export function secureEqual(a:string,b:string){
 const first=Buffer.from(a),second=Buffer.from(b);
 return first.length>0&&first.length===second.length&&timingSafeEqual(first,second);
}
