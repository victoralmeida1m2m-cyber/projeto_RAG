# Edital Fácil — Projeto Integrador PIT (2026)

Esta implementação usa **Next.js/React**, **PostgreSQL no Neon**, **Google Gemini API** e **Vercel**. O projeto original Python/Streamlit/MongoDB foi preservado na raiz; a implementação acadêmica está em `integrador/`.

## Arquitetura e funcionalidades
- Biblioteca pública com editais cadastrados por administradores; PDF com texto selecionável, até 4 MB e 150 páginas.
- Trechos dos PDFs persistidos em `trechos`, relacionados à tabela `editais`; respostas registradas em `consultas`.
- Busca por relevância no PostgreSQL (full-text search) e geração de respostas pelo Gemini, com fontes numeradas.
- Comparação de PDFs, controles de publicação e login administrativo (sessão HttpOnly e senha armazenada com scrypt + salt).
- Leitura de documentos sem login; cadastro/exclusão e diagnóstico técnico exigem sessão de administrador.
- Máximo de 3 consultas por IP/24h para visitantes e 50 chamadas de IA/24h em todo o sistema. São **limites internos**, não garantem gratuidade da API.

## Variáveis de ambiente
| Nome | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão SSL ao Neon/PostgreSQL, somente no servidor |
| `GEMINI_API_KEY` | Chave da Gemini API; cadastrar criptografada em Preview e Production |
| `GEMINI_MODEL` | Modelo validado com API real: `gemini-3.5-flash-lite` |
| `ADMIN_WRITE_KEY` | Código único inicial da primeira conta administrativa |
| `ADMIN_RECOVERY_CODE` | Opcional: código de recuperação de senha de uso único, não deve ser divulgado |

Não inclua chaves em código, commits ou capturas de tela. Uma chave inserida em conversa deve ser **rotacionada** no Google AI Studio após os testes e substituída na Vercel.

## Desenvolvimento local
1. Instale Node.js 22 e entre em `integrador/`.
2. Rode `npm install`, `npm run typecheck`, `npm run build`.
3. Crie `.env.local` a partir de `.env.example`, sem commitá-lo.
4. Rode `npm run dev` e abra a porta informada.
5. Execute `sql/schema.sql` no Neon caso esteja preparando um banco novo.

## Deploy e validação
A Vercel utiliza framework Next.js, Node.js 22 e Root Directory `integrador`. A branch `feat/projeto-integrador-react-neon-vercel` publica um Preview isolado; a Production deve ser promovida após os testes.

Checklist:
- GET `/api/health`: resposta HTTP 200 e `banco: conectado`.
- GET `/api/auth/me`: estado correto da sessão.
- GET `/api/editais`: dados persistidos no Neon.
- Login administrativo em `/admin` e botão **Testar Gemini com fonte**.
- POST `/api/ia` com um edital publicado: verificar HTTP 200, texto, array de fontes e citação numérica válida.
- Recarregar a página, cadastrar/arquivar/excluir um PDF fictício, comparar duas versões e conferir a visualização mobile.
- A API pode ter limites de uso gratuitos diferentes por conta/modelo; consultar o Google AI Studio.

## Requisitos e evidências para a apresentação
- React responsivo, formulários, rotas REST e inteligência artificial real.
- PostgreSQL com `editais`, `trechos`, `consultas` e duas FKs, JOIN e índices em `sql/consultas_avaliacao.sql`.
- Capturas reais: fluxo CRUD, persistência após recarga, esquema SQL e índice/EXPLAIN, integração IA com fontes, Vercel/URL e contribuição de todos os integrantes.
- Prazo acadêmico citado: 04/12/2026. Não apresentar resultados simulados como provas reais.

## Limitações e segurança
Este é um projeto acadêmico, não uma plataforma de concursos certificada. Não armazene documentos privados. PDFs digitalizados sem texto não são suportados (sem OCR). A validação de citação é numérica e não garante precisão factual; o edital oficial prevalece. Para lançamento público, complementar com monitoramento de custos, recuperação de conta autenticada por e-mail, quotas por usuário, CAPTCHA, auditoria e política de privacidade.
