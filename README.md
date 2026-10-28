# Bomfim Leilões — Catálogo de produtos

Site de catálogo para revenda de itens de devolução (Amazon e outras lojas):
vitrine pública com pop-up de detalhes e botão para o WhatsApp, mais um painel
administrativo para cadastrar, editar e remover produtos.

## Recursos

- **Vitrine** (`/`): logo no topo à esquerda, grade de produtos e pop-up com
  galeria de fotos, descrição, preço e botão **Falar no WhatsApp** (abre o
  WhatsApp com uma mensagem já preenchida com o nome e o preço do item).
- **Ordenação automática**: produtos **disponíveis** primeiro, depois
  **reservados**, depois **vendidos** — e, dentro de cada grupo, os mais
  recentes primeiro.
- **Painel** (`/admin`): login com usuário e senha, lista de produtos com
  troca de status, publicar/ocultar, editar e excluir, além de uma tela de
  configurações (nome do site, logo, número e mensagem do WhatsApp).
- **Fotos**: enviadas pelo painel, redimensionadas no navegador e guardadas no
  Supabase Storage.

## Tecnologias

| Camada     | Escolha                                            |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + React 19 + TypeScript    |
| Estilo     | Tailwind CSS v4                                    |
| Banco      | PostgreSQL (Supabase) via Prisma ORM 7             |
| Imagens    | Supabase Storage (bucket público)                  |
| Login      | senha com bcrypt + sessão em cookie assinado (jose)|
| Deploy     | Vercel                                             |

> O banco é PostgreSQL puro e o acesso passa todo pelo Prisma — trocar de
> provedor (Neon, RDS, etc.) é só mudar a `DATABASE_URL`.

---

## 1. Rodando localmente (sem instalar banco)

Para desenvolver sem criar um projeto no Supabase, o projeto sobe um PostgreSQL
local em memória (PGlite) na porta 5432.

```bash
npm install

# terminal 1 — banco local
npm run db:local

# terminal 2 — dados de exemplo (só na primeira vez)
npm run db:seed:local

# terminal 3 — aplicação
npm run dev:local
```

Acesse <http://localhost:3000>. Painel em <http://localhost:3000/admin>.

Os dados locais ficam na pasta `.pglite/` (fora do controle de versão).

---

## 2. Configurando o Supabase (para produção)

1. Crie um projeto em <https://supabase.com>.
2. **Banco**: em *Settings → Database → Connection string*, copie:
   - **Transaction pooler** (porta 6543) → `DATABASE_URL`
   - **Session pooler / Direct** (porta 5432) → `DIRECT_URL`
3. **Fotos**: em *Storage*, crie um bucket chamado **`products`** e marque como
   **público**.
4. **Chaves**: em *Settings → API*, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (é secreta, só o servidor usa)
5. Cole tudo no arquivo `.env` (já existe uma cópia-modelo em `.env.example`).
6. Crie as tabelas e os dados iniciais:

```bash
npm run db:push    # cria o schema a partir do Prisma
npm run db:seed    # configurações padrão + produtos de exemplo
npm run dev        # http://localhost:3000
```

> Alternativa ao `db:push`: cole o conteúdo de `prisma/init.sql` no
> *SQL Editor* do Supabase.
> Ao mudar o schema, regenere esse arquivo com `npm run db:sql`.

---

## 3. Publicando no Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em <https://vercel.com>, clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, cadastre **as mesmas chaves do `.env`**
   (para *Production*, *Preview* e *Development*):

   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`

4. Clique em **Deploy**. (O `npm run build` já roda `prisma generate` antes.)
5. Se ainda não criou as tabelas, rode `npm run db:push` uma vez apontando para
   o Supabase, na sua máquina.

---

## 4. Acesso ao painel e segurança

- Endereço: `/admin`
- **Usuário padrão:** `admin`
- **Senha padrão:** `bomfim2026` ⚠️ **troque antes de publicar**

Para trocar a senha, gere um novo hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('SUA_NOVA_SENHA',10))"
```

Atualize `ADMIN_PASSWORD_HASH` no `.env` (e no Vercel). **Atenção ao lugar:**

- No arquivo **`.env`** (local): o Next expande variáveis que começam com `$`,
  então escape cada cifrão do hash com `\`, assim: `\$2b\$10\$...`.
- No **Vercel** (ou qualquer painel de variáveis): cole o hash **cru**, sem as
  barras invertidas — lá não há expansão de `$`.

Também vale trocar `AUTH_SECRET` (gere com `openssl rand -base64 32`) para
invalidar sessões antigas.

---

## 5. Estrutura do projeto

```
prisma/
  schema.prisma        # modelos Product, ProductImage, Setting
  seed.ts              # dados iniciais (configurações + exemplos)
  init.sql             # DDL gerado a partir do schema
prisma.config.ts       # configuração do Prisma 7 (URL do banco, seed)
src/
  app/
    page.tsx                         # vitrine
    admin/login/page.tsx             # login
    admin/(painel)/...               # painel protegido
  components/                        # card, modal, formulários do painel
  lib/
    actions/                         # Server Actions (auth, produtos, config)
    auth.ts  prisma.ts  supabase.ts  # acesso a dados e segurança
    constants.ts  format.ts  types.ts
  proxy.ts                           # protege /admin (checagem otimista)
scripts/dev-db.mjs                   # PostgreSQL local (PGlite)
```

### Scripts úteis

| Comando             | O que faz                                              |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Sobe o site (usando o `.env`, ou seja, Supabase)       |
| `npm run dev:local` | Sobe o site apontando para o banco local (PGlite)      |
| `npm run db:local`  | Inicia o PostgreSQL local                              |
| `npm run db:seed`   | Popula configurações padrão e produtos de exemplo      |
| `npm run db:push`   | Cria/atualiza as tabelas no banco do `.env`            |
| `npm run db:studio` | Abre o Prisma Studio para ver/editar os dados          |
| `npm run db:sql`    | Regera `prisma/init.sql` a partir do schema            |
| `npm run build`     | Build de produção                                      |
| `npm run typecheck` | Checagem de tipos                                      |
| `npm run lint`      | Análise estática (ESLint)                              |

---

## 6. Observações

- **Preço** é guardado em centavos (`priceCents`) e exibido no formato
  `R$ 1.250,00`.
- **Fotos**: o navegador reduz cada imagem antes do envio (limite de ~4,5 MB por
  requisição no Vercel). Recomenda-se até 8 fotos por produto.
- **Status**: `AVAILABLE` (Disponível), `RESERVED` (Reservado) e `SOLD`
  (Vendido). Guardado como texto no banco, para facilitar migrações.
- **WhatsApp**: configurado no painel em *Configurações*, no formato
  internacional só com dígitos (ex.: `5511999998888`). A mensagem aceita os
  marcadores `{produto}` e `{preco}`.
