# Design System — Bento Mini UI + Interactive Hover Button

## Origem
- [Bento Mini UI — 21st.dev/@sajad](https://21st.dev/@sajad/components/bento-mini-ui): pequenas microinterfaces animadas dentro de cards, animação de entrada e destaque contextual.
- [Interactive Hover Button — 21st.dev/@Shatlyk1011](https://21st.dev/@Shatlyk1011/components/interactive-hover-button): expansão de ponto colorido no hover, transição de texto e estados idle/loading/success.
- Os componentes foram adaptados para React 19/Next.js 15 e CSS nativo, sem adição de pacotes de animação.

## Decisões de produto
- Cards inteiros são botões semânticos que navegam para Biblioteca, Comparador e Assistente IA.
- Os números e títulos dos arquivos refletem dados do acervo realmente retornados pelo Neon. A pequena comparação e a conversa ilustrativas não são resultados do usuário e são claramente rotuladas como prévias.
- O botão não simula requisições ou sucesso: seu loading vem do estado `ocupado` e sucesso é exibido somente após resultado confirmado.
- Funcionalidades originais (login, cadastro, CRUD, consulta IA, comparação, recuperação) não tiveram APIs modificadas.
- Tema original carvão e verde-lima mantido. Foco visível e `prefers-reduced-motion` suportados.

## Validação exigida
1. Build Next.js/TypeScript
2. Home e arquivos estáticos em preview
3. Rotas `/api/health`, `/api/editais` e `/api/auth/me` em preview
4. Verificação de publicação em Production
5. Teste visual/manual das interações e operações autenticadas permanece necessário, a menos que seja executado explicitamente.

## Observação
A seção de comparação e o chat em miniatura são ilustrações decorativas de funcionalidades reais; não exibem respostas de IA fabricadas.
