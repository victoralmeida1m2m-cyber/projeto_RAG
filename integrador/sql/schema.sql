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

-- Autenticação administrativa e limites antiabuso (sem alterar os registros existentes)
CREATE TABLE IF NOT EXISTS admin_users (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 email VARCHAR(254) NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 singleton SMALLINT NOT NULL DEFAULT 1 UNIQUE CHECK(singleton=1),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash CHAR(64) PRIMARY KEY,
 admin_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 expira_em TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expira ON admin_sessions(expira_em);
CREATE TABLE IF NOT EXISTS request_limits (
 chave CHAR(64) PRIMARY KEY,
 janela_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 acessos INTEGER NOT NULL DEFAULT 1 CHECK(acessos>=1)
);
