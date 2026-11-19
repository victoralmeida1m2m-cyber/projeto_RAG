# Relatório técnico — Edital Fácil (PIT)

## Problema e público
Editais longos dificultam buscar prazos, critérios e cargos. O público-alvo é estudantes e candidatos; a solução possibilita cadastrar um edital fictício, consultá-lo e comparar versões.

## Arquitetura
Browser React → Next.js Route Handlers no Vercel → Neon/PostgreSQL e Grok (xAI). O backend usa variáveis de ambiente e SQL parametrizado; nunca expõe as credenciais privadas no navegador.

## Modelagem
editais: PK id, concurso, cargo, nome_arquivo, status, total_paginas, criado_em.
trechos: PK id, FK edital_id, pagina, sequencia, texto.
consultas: PK id, FK edital_id, pergunta, resposta, criado_em.
Cada relação usa FK com ON DELETE CASCADE. Há CHECK, NOT NULL, UNIQUE e índices. O cadastro de edital e trechos é atômico via CTE. Consultas e plano de execução estão em sql/consultas_avaliacao.sql.

## React e API
Quatro áreas funcionais: Biblioteca, Cadastro, IA, Comparador. Formularios reais gravam e consultam dados persistidos (F5); existem feedbacks, mensagens de erro, carregamento e layout responsivo. Operações de escrita exigem chave de demonstração.

## IA
Recupera até 5 trechos por busca textual SQL (to_tsvector/ts_rank), envia ao Grok, valida índices de citações ou abstenção e persiste o histórico. Isso não equivale a busca vetorial. A verificação numérica das fontes não prova a exatidão semântica.

## Evidências a coletar
E1 commits do trio, E2 cadastro e F5, E3 JOIN real/diagrama, E4 EXPLAIN antes/depois, E5 Grok real com fontes, E6 Vercel + celular. O grupo precisa documentar e apresentar os testes reais.

## Integrantes
Inserir os três nomes e contribuições efetivas antes da entrega de 04/12/2026.
