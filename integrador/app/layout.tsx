import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={
 title:'Edital Fácil | Inteligência Documental',
 description:'Biblioteca e assistente de editais com React, PostgreSQL Neon e Gemini',
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-BR"><body>{children}</body></html>;
}
