# Cloudflare Pages Deploy

This project is prepared for Cloudflare Pages or Workers Static Assets with a Worker at `public/_worker.js`.

## What Runs Where

- Static frontend assets: `public`
- Prerendered routes:
  - `/ca-phe/`
  - `/san-pham/ca-phe-rang-xay-nguyen-chat-signature/`
  - `/san-pham/bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1/`
  - `/gio-hang/`
- Cloudflare Worker routes:
  - `GET /api/orders`
  - `POST /api/orders`
  - `GET /api/health`
  - `GET /admin/orders`

Orders are stored in Cloudflare KV binding `ORDERS_KV`.

`wrangler.toml` is configured with:

```toml
main = "public/_worker.js"

[assets]
directory = "./public"
binding = "ASSETS"
```

This prevents the Cloudflare Dashboard error that asks for `main = "src/index.ts"` or `[assets] directory = "./dist"`.

## One-Time Cloudflare Setup

Wrangler and Playwright are already listed in `devDependencies`. If you clone this project elsewhere, install dependencies first:

```powershell
npm install
```

Login:

```powershell
npx wrangler login
```

Create KV namespaces:

```powershell
npx wrangler kv namespace create ORDERS_KV
npx wrangler kv namespace create ORDERS_KV --preview
```

Copy the returned IDs into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "ORDERS_KV"
id = "your_production_id"
preview_id = "your_preview_id"
```

## Build / Prerender

Run the local Node server:

```powershell
node server.js
```

In another terminal:

```powershell
node scripts/prerender-cloudflare.js
```

## Local Cloudflare Test

```powershell
npm run cf:dev
```

Open the URL shown by Wrangler and test:

- `/gio-hang/`
- `POST /api/orders`
- `/admin/orders`

Automated checks:

```powershell
npm run verify:cloudflare
npm run verify:cloudflare:pages
```

## Cloudflare Pages Git Settings

When deploying from GitHub, create a **Pages** project, not a standalone Worker project.

Use these settings:

```text
Framework preset: None
Build command: npm run build
Build output directory: public
Root directory: /
```

Do not use `npm run cf:deploy` as the Cloudflare Dashboard build command. That command is only for deploying from your own terminal.

If your Cloudflare project is a **Worker** project instead of a **Pages** project, keep the same repository and use this build command:

```text
npm run build
```

The deploy step will read `wrangler.toml` and upload `public` as static assets with `public/_worker.js` as the Worker entry.

## Deploy

```powershell
npm run cf:deploy
```

If you use Cloudflare Dashboard upload instead of CLI, upload the whole `public` directory after KV binding is configured for the Pages project. The backend requires the `ORDERS_KV` binding; uploading assets alone without binding will make `/api/orders` return a backend configuration error.
