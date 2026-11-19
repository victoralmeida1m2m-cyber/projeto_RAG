import { db } from '@/lib/db';
import {NextResponse} from 'next/server';
export const runtime='nodejs';
export async function GET(){
 try{const sql=db();await sql`SELECT 1 AS ok`;return NextResponse.json({status:'ok',banco:'conectado'});}
 catch{return NextResponse.json({status:'erro',banco:'indisponível'},{status:503});}
}
