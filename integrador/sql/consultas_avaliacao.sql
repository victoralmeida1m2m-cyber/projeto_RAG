-- Consulta 1: JOIN + agregado por edital
SELECT e.id,e.concurso,COUNT(t.id) AS total_trechos
FROM editais e JOIN trechos t ON t.edital_id=e.id
GROUP BY e.id,e.concurso ORDER BY total_trechos DESC;
-- Consulta 2: agrupamento e filtro
SELECT status,COUNT(*) AS total FROM editais
GROUP BY status ORDER BY total DESC;
-- EVIDÊNCIA DO ÍNDICE: para EXPLAIN ANTES, execute em uma cópia sem índice
-- ou documente o plano de antes, então aplique o índice e execute depois.
EXPLAIN SELECT id,concurso FROM editais
WHERE status='publicado' ORDER BY criado_em DESC LIMIT 20;
CREATE INDEX IF NOT EXISTS idx_editais_status_criado ON editais(status,criado_em DESC);
EXPLAIN SELECT id,concurso FROM editais
WHERE status='publicado' ORDER BY criado_em DESC LIMIT 20;
-- Em tabelas pequenas Seq Scan pode ser escolha correta do otimizador.
