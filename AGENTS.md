# Agent Instructions — run-mishe-admin

## Feature layout

```
src/features/<domain>/
  api.ts          # fetch wrappers
  types.ts        # API types
  components/     # domain UI pieces

src/pages/<domain>/   # route-level pages
```

## API client

Use `src/lib/api-client.ts` (`apiGet`, `buildApiUrl`).  
Base URL: `VITE_API_BASE_URL` (default `http://localhost:4002/api`).

Admin hardware lists:

- `GET /admin/hardware/cpus`
- `GET /admin/hardware/gpus`

Admin game lists:

- `GET /admin/games`

Admin benchmark lists:

- `GET /admin/benchmarks`
- `GET /admin/benchmarks/cpu-scores`
- `GET /admin/benchmarks/gpu-scores`

## Navigation

Sidebar config: `src/config/routes.tsx`  
Routes: `src/App.tsx`

Nested sidebar groups use `children` on `AdminRoute` (see **قطعات → CPU / GPU** and **بنچمارک‌ها → تعاریف / اسکور CPU / اسکور GPU**).

Benchmark pages:

- `/benchmarks/definitions`
- `/benchmarks/cpu-scores`
- `/benchmarks/gpu-scores`

## List pages

Admin list pages should support:

- pagination via URL search params (`page`, `limit`)
- search (`q`)
- filters (vendor, formFactor, quality, sort)

Keep filter state in the URL so links are shareable.
