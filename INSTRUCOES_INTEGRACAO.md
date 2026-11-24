# Versão acadêmica do Edital Fácil
A adaptação está no diretório integrador, preservando os arquivos Python originais.
Para usar: cd integrador && npm install && npm run build && npm run dev.
A Vercel deve usar framework Next.js, rootDirectory integrador e Node 22.x.
Variáveis privadas requeridas: DATABASE_URL, GEMINI_API_KEY e ADMIN_WRITE_KEY; GEMINI_MODEL é opcional. Não versionar segredos.
Leia integrador/README.md e docs/relatorio-tecnico.md para detalhes e evidências ainda a coletar.

Painel de administrador: /admin. A primeira conta é criada com o código inicial ADMIN_WRITE_KEY definido em variável de ambiente na Vercel; depois o login ocorre apenas com e-mail e senha. Visitantes não recebem o código nem podem cadastrar ou remover editais.
