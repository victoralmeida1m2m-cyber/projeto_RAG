# Edital Fácil — Projeto Integrador PIT (2026)

Esta versão acadêmica adapta o Edital Fácil original para **React (Next.js)** + **PostgreSQL/Neon** + **Google Gemini** + **Vercel**. O projeto original em Python/Streamlit/MongoDB com RAG vetorial continua preservado na raiz deste repositório. A nova aplicação fica isolada no diretório integrador.

## Objetivo e fluxo completo
Cadastrar um edital fictício em PDF → extrair trechos → salvar no PostgreSQL → listar na interface React → recarregar a página (dados persistem) → consultar com IA real e fontes → arquivar ou excluir. O comparador de PDFs é funcionalidade complementar.

## Requisitos acadêmicos
- React com quatro áreas navegáveis: Biblioteca, Cadastro, Assistente IA e Comparador.
- Formulários, listagem persistente, mensagens de sucesso/erro, carregamento, responsividade e foco visível.
- Next.js Route Handlers: GET/POST de editais; GET/PATCH/DELETE por ID; POST de IA e comparação.
- Neon PostgreSQL: 3 tabelas (editais, trechos, consultas), 2 FKs, PKs, CHECK/NOT NULL/UNIQUE e índices.
- SQL: JOIN, agregação e EXPLAIN documentados em sql/consultas_avaliacao.sql.
- Gemini chamado no servidor, com verificação estrutural de citações e gravação do histórico.
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
| GEMINI_API_KEY | Chave Gemini do usuário, habilitada para o modelo indicado |
| GEMINI_MODEL | Nome do modelo, padrão gemini-2.5-flash |
| ADMIN_WRITE_KEY | Segredo privado de 16+ caracteres para operações de escrita e consultas IA |

Execute sql/schema.sql no Neon. Abra /api/health para confirmar banco conectado.

## Deploy no Vercel
- Project Framework: Next.js.
- Root Directory: integrador.
- Node Version: 22.x.
- Preview: branch feat/projeto-integrador-react-neon-vercel.
- Production: após validação, merge na main ou ajustar Production Branch.
- Configurar variáveis tanto para Preview quanto para Production.
- Testar upload, F5, consulta Gemini, atualização/exclusão e telas no celular.

## Evidências para o edital (prazo 04/12/2026)
E1 GitHub e commits dos três participantes; E2 persistência após F5; E3 esquema e JOIN; E4 índice e EXPLAIN antes/depois (sem inventar melhoria); E5 IA real com fontes; E6 Vercel e responsividade. Anexe capturas reais e explicações em docs/evidencias. Apresentação 8–10 minutos com todos participando.

## Segurança e limitações
Aceita PDFs com texto selecionável, até 4 MB/150 páginas, sem OCR. Envie apenas dados fictícios ou totalmente públicos. A validação das referências é numérica, não uma prova de precisão factual. O comparador é aproximado. O segredo de demonstração não é armazenado no navegador; para produção real implemente autenticação individual, rate limit, quotas, controles de upload e monitoramento. O projeto não substitui editais oficiais.
