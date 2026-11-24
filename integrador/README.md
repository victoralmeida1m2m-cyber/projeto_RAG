# Edital Fácil — Projeto Integrador PIT (2026)

Esta versão acadêmica adapta o Edital Fácil original para **React (Next.js)** + **PostgreSQL/Neon** + **Hugging Face Inference Providers** + **Vercel**. O projeto original em Python/Streamlit/MongoDB com RAG vetorial continua preservado na raiz deste repositório. A nova aplicação fica isolada no diretório integrador.

## Objetivo e fluxo completo
Cadastrar um edital fictício em PDF → extrair trechos → salvar no PostgreSQL → listar na interface React → recarregar a página (dados persistem) → consultar com IA real e fontes → arquivar ou excluir. O comparador de PDFs é funcionalidade complementar.

## Requisitos acadêmicos
- React com biblioteca pública, assistente IA com limite, comparador e cadastro restrito a administradores. Página `/admin` para login.
- Formulários, listagem persistente, mensagens de sucesso/erro, carregamento, responsividade e foco visível.
- Next.js Route Handlers: GET/POST de editais; GET/PATCH/DELETE por ID; POST de IA e comparação.
- Neon PostgreSQL: 3 tabelas (editais, trechos, consultas), 2 FKs, PKs, CHECK/NOT NULL/UNIQUE e índices.
- SQL: JOIN, agregação e EXPLAIN documentados em sql/consultas_avaliacao.sql.
- Hugging Face chamado no servidor, com verificação estrutural de citações e gravação do histórico.
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
| HF_TOKEN | Token do Hugging Face com permissão 'Make calls to Inference Providers'; crie em https://huggingface.co/settings/tokens |
| HF_MODEL | ID do modelo de chat disponível em um Inference Provider; ponto de partida: Qwen/Qwen2.5-7B-Instruct:fastest |
| ADMIN_WRITE_KEY | Código inicial de ativação do primeiro administrador, utilizado uma única vez |

A autenticação agora usa as tabelas `admin_users`, `admin_sessions` e `request_limits` no Neon. Ative a conta apenas uma vez em `/admin` usando o código inicial `ADMIN_WRITE_KEY` e escolha seu próprio e-mail e senha (12+ caracteres). Após a ativação, entre sempre pelo login — a chave técnica não aparece na tela principal. A senha é armazenada usando scrypt com salt aleatório, a sessão usa cookie HttpOnly + Secure e expira em 12h. O login permite no máximo 7 tentativas por 15 minutos por combinação de IP/e-mail.

Público: leitura de editais publicados, comparador e até 3 perguntas Hugging Face por IP em 24 horas, com limite geral de 50 perguntas por 24 horas para conter custo. Em produção real, adicionar CAPTCHA, autenticação para visitantes, políticas de privacidade, medição de gastos, proteção contra múltiplos IPs e observabilidade. Essas cotas não garantem custo zero.

Execute sql/schema.sql no Neon. Abra /api/health para confirmar banco conectado.

## Deploy no Vercel
- Project Framework: Next.js.
- Root Directory: integrador.
- Node Version: 22.x.
- Preview: branch feat/projeto-integrador-react-neon-vercel.
- Production: após validação, merge na main ou ajustar Production Branch.
- Configurar HF_TOKEN e HF_MODEL tanto para Preview quanto para Production. O token nunca deve ir ao navegador nem ao GitHub.
- Testar upload, F5, consulta Hugging Face, atualização/exclusão e telas no celular.

## Evidências para o edital (prazo 04/12/2026)
E1 GitHub e commits dos três participantes; E2 persistência após F5; E3 esquema e JOIN; E4 índice e EXPLAIN antes/depois (sem inventar melhoria); E5 IA real com fontes; E6 Vercel e responsividade. Anexe capturas reais e explicações em docs/evidencias. Apresentação 8–10 minutos com todos participando.

Os Inference Providers do Hugging Face podem oferecer créditos gratuitos limitados conforme a conta, mas não são ilimitados nem têm disponibilidade garantida para todo modelo. Consulte https://huggingface.co/settings/billing e https://huggingface.co/settings/tokens antes de testar; a assinatura do ChatGPT e outras APIs não se aplicam.

## Segurança e limitações
Aceita PDFs com texto selecionável, até 4 MB/150 páginas, sem OCR. Envie apenas dados fictícios ou totalmente públicos. A validação das referências é numérica, não uma prova de precisão factual. O comparador é aproximado. A chave inicial é utilizada apenas na configuração de conta. O administrador usa login com e-mail e senha; para produção real implemente CAPTCHA, recuperação de conta, políticas contra ataques distribuídos, quotas por usuário, controles de upload e monitoramento. O projeto não substitui editais oficiais.

## Ativação da API Hugging Face
1. Entre em https://huggingface.co/settings/tokens e crie um token fine-grained que permita **Make calls to Inference Providers**.
2. Na Vercel, crie a variável **HF_TOKEN** como segredo criptografado nos ambientes Preview e Production. Não cole o token em tickets, repositórios ou conversas.
3. Configure **HF_MODEL** com o ID de um modelo de chat suportado no seu painel de Inference Providers (valor inicial de referência: `Qwen/Qwen2.5-7B-Instruct:fastest`; disponibilidade deve ser confirmada na conta).
4. Execute um novo deploy para que as variáveis sejam aplicadas. Teste uma pergunta no Assistente IA com edital publicado e confira as citações numéricas.
5. Se aparecer HTTP 402/429, confira os créditos ou limites gratuitos. Não ative cobrança automática sem avaliar os custos.
Endpoint de integração: `https://router.huggingface.co/v1/chat/completions`, com `Authorization: Bearer HF_TOKEN`, executado somente no servidor.

## Teste rápido da API sem enviar editais
Após configurar HF_TOKEN, abra `/admin`, faça login e clique em **Testar conexão com a IA**. O endpoint protegido `POST /api/admin/testar-ia` envia uma mensagem mínima ao modelo, retorna status e nome do modelo, sem expor o token. O teste é limitado a 5 chamadas/24h e participa do limite global de 50 chamadas/24h. Se aprovado, valide o caminho completo pelo Assistente IA usando um edital publicado, conferindo resposta e fontes.
