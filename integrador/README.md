# Edital Fácil — Projeto Integrador PIT (2026)

Esta versão acadêmica adapta o Edital Fácil original para **React (Next.js)** + **PostgreSQL/Neon** + **Grok (xAI)** + **Vercel**. O projeto original em Python/Streamlit/MongoDB com RAG vetorial continua preservado na raiz deste repositório. A nova aplicação fica isolada no diretório integrador.

## Objetivo e fluxo completo
Cadastrar um edital fictício em PDF → extrair trechos → salvar no PostgreSQL → listar na interface React → recarregar a página (dados persistem) → consultar com IA real e fontes → arquivar ou excluir. O comparador de PDFs é funcionalidade complementar.

## Requisitos acadêmicos
- React com biblioteca pública, assistente IA com limite, comparador e cadastro restrito a administradores. Página `/admin` para login.
- Formulários, listagem persistente, mensagens de sucesso/erro, carregamento, responsividade e foco visível.
- Next.js Route Handlers: GET/POST de editais; GET/PATCH/DELETE por ID; POST de IA e comparação.
- Neon PostgreSQL: 3 tabelas (editais, trechos, consultas), 2 FKs, PKs, CHECK/NOT NULL/UNIQUE e índices.
- SQL: JOIN, agregação e EXPLAIN documentados em sql/consultas_avaliacao.sql.
- Grok chamado no servidor, com verificação estrutural de citações e gravação do histórico.
- GitHub, documentação e Vercel. Evidências reais e participação dos três integrantes ainda dependem da apresentação.

**Atenção:** a nova versão usa recuperação textual PostgreSQL (ts_rank / to_tsvector), não busca vetorial MongoDB. A implementação vetorial original permanece na raiz.

## Instalação
Node.js 22 LTS. Na raiz do repositório execute:

    cd integrador
    npm install
    npm run typecheck
    npm run build
    npm run dev

Copie .env.example para .env.local e configure as variáveis abaixo somente no ambiente local. No Vercel, configure-as em Settings > Environment Variables. Nunca publique segredos ou chaves em arquivos versionados.

| Variável | Uso |
| --- | --- |
| DATABASE_URL | URL privada do PostgreSQL Neon com SSL |
| XAI_API_KEY | Chave da API xAI com créditos e permissão para o modelo |
| XAI_MODEL | Nome do modelo disponível na xAI; padrão grok-4 |
| ADMIN_WRITE_KEY | Código inicial de ativação do primeiro administrador, utilizado uma única vez |

A autenticação agora usa as tabelas `admin_users`, `admin_sessions` e `request_limits` no Neon. Ative a conta apenas uma vez em `/admin` usando o código inicial `ADMIN_WRITE_KEY` e escolha seu próprio e-mail e senha (12+ caracteres). Após a ativação, entre sempre pelo login — a chave técnica não aparece na tela principal. A senha é armazenada usando scrypt com salt aleatório, a sessão usa cookie HttpOnly + Secure e expira em 12h. O login permite no máximo 7 tentativas por 15 minutos por combinação de IP/e-mail.

Público: leitura de editais publicados, comparador e até 3 perguntas Grok por IP em 24 horas, com limite geral de 50 perguntas por 24 horas para conter custo. Em produção real, adicionar CAPTCHA, autenticação para visitantes, políticas de privacidade, medição de gastos, proteção contra múltiplos IPs e observabilidade. Essas cotas não garantem custo zero.

Execute sql/schema.sql no Neon. Abra /api/health para confirmar banco conectado.

## Deploy no Vercel
- Project Framework: Next.js.
- Root Directory: integrador.
- Node Version: 22.x.
- Preview: branch feat/projeto-integrador-react-neon-vercel.
- Production: após validação, merge na main ou ajustar Production Branch.
- Configurar variáveis tanto para Preview quanto para Production.
- Testar upload, F5, consulta Grok, atualização/exclusão e telas no celular.

## Evidências para o edital (prazo 04/12/2026)
E1 GitHub e commits dos três participantes; E2 persistência após F5; E3 esquema e JOIN; E4 índice e EXPLAIN antes/depois (sem inventar melhoria); E5 IA real com fontes; E6 Vercel e responsividade. Anexe capturas reais e explicações em docs/evidencias. Apresentação 8–10 minutos com todos participando.

O uso da API da xAI pode gerar cobrança por tokens e depende de saldo/créditos. A assinatura do aplicativo Grok, quando houver, não substitui necessariamente o acesso à API.

## Segurança e limitações
Aceita PDFs com texto selecionável, até 4 MB/150 páginas, sem OCR. Envie apenas dados fictícios ou totalmente públicos. A validação das referências é numérica, não uma prova de precisão factual. O comparador é aproximado. A chave inicial é utilizada apenas na configuração de conta. O administrador usa login com e-mail e senha; para produção real implemente CAPTCHA, recuperação de conta, políticas contra ataques distribuídos, quotas por usuário, controles de upload e monitoramento. O projeto não substitui editais oficiais.
