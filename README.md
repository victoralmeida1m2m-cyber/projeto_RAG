# Edital Fácil

**Uma experiência inteligente para explorar, consultar e comparar editais de concursos públicos.**

Aplicação desenvolvida em **Python e Streamlit**, com processamento de PDFs, **MongoDB Atlas Vector Search** e **RAG (Retrieval-Augmented Generation)** integrado ao **Google Gemini**. Além do chat contextualizado, o projeto oferece biblioteca interativa, comparador de versões e análise textual de retificações.

> **Projeto de portfólio — execução local ou no GitHub Codespaces.** Não há demonstração pública hospedada. As respostas de IA e as análises textuais são auxiliares: os documentos oficiais devem ser sempre consultados.

![Página inicial do Edital Fácil](assets/pagina-inicial.png)

## Funcionalidades

| Módulo | O que faz |
| --- | --- |
| **Ingestão de editais** | Recebe PDFs, extrai o texto com PyMuPDF e organiza trechos (chunks) com referência às páginas. |
| **MongoDB Atlas** | Armazena editais, metadados, trechos e embeddings. |
| **Biblioteca interativa** | Exibe os editais cadastrados em um carrossel animado e permite abrir o chat com o documento selecionado. |
| **Chat RAG** | Recupera trechos relevantes por busca vetorial e solicita ao Gemini uma resposta contextualizada, com fontes. |
| **Validação de citações** | Confere a numeração das fontes mencionadas e permite ao assistente reconhecer ausência de evidências. |
| **Comparação de versões** | Identifica diferenças textuais entre dois PDFs completos: adições, remoções e substituições. |
| **Retificações** | Procura pares “Onde se lê / Leia-se” e tenta localizar o texto anterior no edital de origem. |

## Demonstração da interface

### 1. Biblioteca de editais

Carrossel com navegação, animações e integração à seleção do documento no chat.

![Biblioteca interativa com carrossel](assets/biblioteca-carrossel.png)

### 2. Chat com o edital

Seleção do documento ativo, histórico de conversa e consulta aos trechos do PDF.

**Seleção do edital**

![Chat — documento selecionado](assets/chat-parte-1.png)

**Área de conversa**

![Chat — interface para perguntas](assets/chat-parte-2.png)

> As imagens do chat mostram a interface antes do envio de uma pergunta, não uma resposta gerada. A funcionalidade de respostas com fontes é implementada no código.

### 3. Comparador de versões
![alt text](image.png)
Dois documentos enviados para identificar diferenças textuais, preservando as referências às páginas.

![Comparador de editais](assets/comparador.png)

### 4. Analisador de retificações

Interface independente em branco, laranja e azul-marinho, com componentes de upload inspirados em documentos PDF.

![Analisador de retificações](assets/retificacoes.png)

## Tecnologias

| Área | Stack |
| --- | --- |
| Linguagem | Python |
| Aplicação web | Streamlit |
| Interface | HTML, CSS e JavaScript (carrossel integrado ao Streamlit) |
| Processamento de PDFs | PyMuPDF |
| Persistência | MongoDB Atlas e PyMongo |
| Embeddings | Sentence Transformers — `paraphrase-multilingual-MiniLM-L12-v2` |
| Busca semântica | MongoDB Atlas Vector Search |
| Geração de respostas | Google Gemini via `google-genai` |
| Ambiente | `python-dotenv` |
| Testes | `unittest` |

## Arquitetura RAG

```mermaid
flowchart TD
    A[PDF do edital] --> B[Extração de texto por página]
    B --> C[Segmentação em chunks]
    C --> D[Embeddings multilíngues]
    C --> E[(MongoDB Atlas)]
    D --> E
    F[Pergunta do usuário] --> G[Embedding da pergunta]
    G --> H[MongoDB Atlas Vector Search]
    E --> H
    H --> I[Trechos recuperados com páginas]
    I --> J[Gemini: resposta contextualizada]
    F --> J
    J --> K[Verificação de referências]
    K --> L[Resposta e fontes no Streamlit]
```

O fluxo de **comparação de editais** e o de **retificações** usam análise textual dos PDFs e funcionam separadamente do chat RAG.

## Estrutura do projeto

```text
projeto_RAG/
├── app.py                        # Página inicial, processamento e cadastro
├── indexar_editais.py            # Geração e armazenamento de embeddings
├── pages/
│   ├── 1_Chat.py                 # Interface de consultas RAG
│   ├── 2_comparador.py           # Comparação de versões
│   ├── 3_Retificacoes.py         # Análise de retificações
│   └── 4_Biblioteca.py           # Biblioteca interativa
├── services/                     # Banco, chunks, embeddings, busca e RAG
├── ui/                           # Identidade visual e carrossel
├── tests/                        # Testes automatizados
├── assets/                       # Capturas da aplicação
├── requirements.txt
└── README.md
```

## Executar no GitHub Codespaces ou Linux

**Pré-requisitos:** Python 3, um cluster MongoDB Atlas e uma chave da API Gemini. O cluster precisa ter o índice Vector Search configurado.

**1. Clone o repositório:**

```bash
git clone https://github.com/victoralmeida1m2m-cyber/projeto_RAG.git
cd projeto_RAG
```

**2. Crie o ambiente virtual e instale as dependências:**

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

**3. Configure um arquivo `.env` local (não publique este arquivo):**

```dotenv
MONGO_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER/
MONGO_DB=edital_facil
GEMINI_API_KEY=SUA_CHAVE_GEMINI
GEMINI_MODEL=gemini-2.5-flash
```

Os valores acima são **exemplos fictícios**. A conexão MongoDB deve usar sua URI real e os parâmetros necessários no seu cluster. O modelo Gemini configurado precisa estar disponível para sua chave de API.

**4. Configure o índice vetorial no MongoDB Atlas:**

- **Nome do índice:** `vector_index`
- **Campo de vetor:** `embedding`
- **Dimensões:** `384`
- **Similaridade:** `cosine`

A busca aplica um filtro por `documento_id`; portanto, esse campo também precisa estar contemplado na configuração apropriada do índice do Atlas.

Depois de cadastrar documentos, execute a etapa de indexação:

```bash
python indexar_editais.py
```

**5. Inicie o aplicativo:**

```bash
python -m streamlit run app.py --server.address 0.0.0.0 --server.port 8501
```

No Codespaces, abra a porta `8501` na aba **PORTS**. A primeira execução pode levar mais tempo devido ao download do modelo de embeddings.

## Testes

```bash
python -m unittest discover -s tests -v
python -m compileall -q app.py pages services ui
```

Para conferir a sintaxe do carrossel (com Node.js disponível):

```bash
node --check ui/carrossel_frontend/edital-carousel.js
```

## Limitações e próximos aprimoramentos

- PDFs digitalizados sem texto extraível podem exigir OCR, ainda não implementado neste fluxo.
- O analisador de retificações reconhece formatos específicos, principalmente pares “Onde se lê / Leia-se” localizados na mesma página.
- A validação de citações verifica se os números correspondem às fontes recuperadas; **não comprova automaticamente cada afirmação**.
- A precisão das respostas depende da extração do PDF, da cobertura dos embeddings, da recuperação vetorial e da API de IA.
- A aplicação é um **projeto de portfólio**, não um serviço público de consulta a concursos.

## Objetivo técnico

Demonstrar a integração prática entre **engenharia de aplicações Python**, processamento documental, **bancos NoSQL**, **busca vetorial**, **IA generativa com RAG**, testes automatizados e design de interfaces interativas.

---

**Edital Fácil** — projeto educacional e de portfólio. Sempre consulte o edital oficial para confirmar informações sobre concursos públicos.
