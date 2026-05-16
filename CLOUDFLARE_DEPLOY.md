# Cloudflare Pages Deploy

This project is prepared for Cloudflare Pages with a Pages advanced Worker at `public/_worker.js`.

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

## Deploy

```powershell
npm run cf:deploy
```

If you use Cloudflare Dashboard upload instead of CLI, upload the whole `public` directory after KV binding is configured for the Pages project. The backend requires the `ORDERS_KV` binding; uploading assets alone without binding will make `/api/orders` return a backend configuration error.
