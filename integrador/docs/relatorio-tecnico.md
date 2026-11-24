# Relatório técnico — Edital Fácil (PIT)

## Problema e público
Editais longos dificultam buscar prazos, critérios e cargos. O público-alvo é estudantes e candidatos; a solução possibilita cadastrar um edital fictício, consultá-lo e comparar versões.

## Arquitetura
Browser React → Next.js Route Handlers no Vercel → Neon/PostgreSQL e Hugging Face Inference Providers (Hugging Face Inference Providers). O backend usa variáveis de ambiente e SQL parametrizado; nunca expõe as credenciais privadas no navegador.

## Modelagem
editais: PK id, concurso, cargo, nome_arquivo, status, total_paginas, criado_em.
trechos: PK id, FK edital_id, pagina, sequencia, texto.
consultas: PK id, FK edital_id, pergunta, resposta, criado_em.
Cada relação usa FK com ON DELETE CASCADE. Há CHECK, NOT NULL, UNIQUE e índices. O cadastro de edital e trechos é atômico via CTE. Consultas e plano de execução estão em sql/consultas_avaliacao.sql.

## React e API
Quatro áreas funcionais: Biblioteca, Cadastro, IA, Comparador. Formularios reais gravam e consultam dados persistidos (F5); existem feedbacks, mensagens de erro, carregamento e layout responsivo. Operações de escrita exigem login com conta administrativa. Senhas scrypt+salt e sessões HttpOnly no PostgreSQL; o código inicial só permite ativar a primeira conta.

## IA
Recupera até 5 trechos por busca textual SQL (to_tsvector/ts_rank), envia ao Hugging Face Inference Providers, valida índices de citações ou abstenção e persiste o histórico. Isso não equivale a busca vetorial. A verificação numérica das fontes não prova a exatidão semântica.

## Evidências a coletar
E1 commits do trio, E2 cadastro e F5, E3 JOIN real/diagrama, E4 EXPLAIN antes/depois, E5 Hugging Face Inference Providers real com fontes, E6 Vercel + celular. O grupo precisa documentar e apresentar os testes reais.

## Integrantes
Inserir os três nomes e contribuições efetivas antes da entrega de 04/12/2026.

## Perfis e cotas de uso
Visitantes têm acesso somente a editais publicados, comparação e consultas Hugging Face Inference Providers limitadas a 3/IP por 24h. O sistema aplica também teto global de 50 chamadas por 24h. Administradores entram com e-mail e senha, podem cadastrar/arquivar/excluir e trocar a senha. Cookies HttpOnly/SameSite e validação de origem reduzem riscos comuns; login inicial usa código de ativação do ambiente.
