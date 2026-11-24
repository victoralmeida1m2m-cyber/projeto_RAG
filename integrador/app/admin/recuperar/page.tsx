'use client';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react';
export default function RecuperarSenha(){
 const [codigo,setCodigo]=useState('');
 const [nova,setNova]=useState('');
 const [confirmacao,setConfirmacao]=useState('');
 const [erro,setErro]=useState('');
 const [email,setEmail]=useState('');
 const [ocupado,setOcupado]=useState(false);
 async function redefinir(e:React.FormEvent){
  e.preventDefault();setErro('');
  if(nova!==confirmacao){setErro('A confirmação não corresponde à nova senha.');return}
  setOcupado(true);
  try{
   const res=await fetch('/api/auth/recover',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({codigo,nova})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.erro||'Falha ao redefinir a senha.');
   setEmail(String(data.email??''));setCodigo('');setNova('');setConfirmacao('');
  }catch(e){setErro(e instanceof Error?e.message:'Erro inesperado.')}
  finally{setOcupado(false)}
 }
 return <div className="app-shell">
  <header className="topbar"><a className="wordmark" href="/">edital<span>.fácil</span><small> / RECUPERAÇÃO DE ACESSO</small></a><a className="outline-btn" href="/admin"><ArrowLeft size={16}/> Entrar</a></header>
  <main className="admin-page">
   <div className="eyebrow"><span className="dot"/> RECUPERAÇÃO SEGURA <span className="line"/> ADMINISTRADOR</div>
   <h1>REDEFINIR <em>SENHA.</em></h1>
   <p className="lead">Sua conta e seus editais serão preservados. A senha antiga não será exibida.</p>
   {erro&&<div className="notice error" role="alert">{erro}</div>}
   {email?<section className="form-card">
    <div className="admin-title"><CheckCircle2 size={28}/><h2>Senha alterada!</h2></div>
    <p>Entre novamente com o e-mail <strong>{email}</strong> e a sua nova senha.</p>
    <p className="helper">Todas as sessões anteriores foram encerradas. O código de recuperação foi invalidado.</p>
    <a href="/admin" className="action">Ir para login</a>
   </section>:<section className="form-card">
    <div className="admin-title"><KeyRound size={25}/><div><h2>Recuperar o acesso</h2><p>Para proprietários da conta Vercel do projeto.</p></div></div>
    <p className="helper">No painel Vercel → Settings → Environment Variables, crie a variável criptografada <strong>ADMIN_RECOVERY_CODE</strong> com uma chave aleatória de pelo menos 24 caracteres, para Preview e Production, e faça um novo deploy. O código é de uso único.</p>
    <form onSubmit={redefinir} className="admin-fields">
     <label>Código de recuperação<input type="password" autoComplete="off" required minLength={24} maxLength={256} value={codigo} onChange={e=>setCodigo(e.target.value)} placeholder="Código seguro definido na Vercel"/></label>
     <label>Nova senha<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={nova} onChange={e=>setNova(e.target.value)} placeholder="No mínimo 12 caracteres"/></label>
     <label>Confirmar nova senha<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} placeholder="Digite a senha novamente"/></label>
     <button type="submit" className="action" disabled={ocupado}>{ocupado?<LoaderCircle size={17} className="spin"/>:<KeyRound size={17}/>} Redefinir minha senha</button>
    </form>
   </section>}
  </main>
 </div>
}
