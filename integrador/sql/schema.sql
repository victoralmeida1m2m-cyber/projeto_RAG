-- Modelo relacional PIT: 3 tabelas e 2 chaves estrangeiras
CREATE TABLE IF NOT EXISTS editais (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 concurso VARCHAR(150) NOT NULL CHECK (length(trim(concurso)) >= 3),
 cargo VARCHAR(150) NOT NULL CHECK (length(trim(cargo)) >= 2),
 nome_arquivo VARCHAR(200) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'publicado' CHECK(status IN ('publicado','arquivado')),
 total_paginas INTEGER NOT NULL CHECK(total_paginas > 0),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS trechos (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 edital_id BIGINT NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
 pagina INTEGER NOT NULL CHECK (pagina>0),
 sequencia INTEGER NOT NULL CHECK (sequencia>=0),
 texto TEXT NOT NULL CHECK (length(trim(texto))>0),
 UNIQUE (edital_id,sequencia)
);
CREATE TABLE IF NOT EXISTS consultas (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 edital_id BIGINT NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
 pergunta VARCHAR(600) NOT NULL,
 resposta TEXT NOT NULL,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_editais_status_criado ON editais(status,criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_trechos_edital_pagina ON trechos(edital_id,pagina);
