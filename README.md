# vue-project

## Project Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

Frontend API requests should use the `/api` prefix. Vite proxies `/api` to `http://localhost:3000` and removes the `/api` prefix before forwarding.

## Sync Backend APIs

The backend Swagger UI is `http://localhost:3000/docs`, and the OpenAPI JSON is `http://localhost:3000/docs-json`.

```sh
pnpm api:gen
```

This command uses Orval to generate API request functions and types into `src/api/generated/`. Run it again after backend API changes.

Generated requests use `src/api/request.ts` as the shared request interceptor. It injects the local token, shows error messages, redirects to login on `401`, and shows a permission warning on `403`.

## Build

```sh
pnpm build
```

## Lint

```sh
pnpm lint
```
