# EQC Asset Management Platform — Frontend

**Organization:** OTH Equipment Co. | Olympus Thailand Medical Division  
**Version:** 1.1 | May 2026  
**Stack:** React 18 · TypeScript · Vite · Azure AD MSAL · TanStack Query · shadcn/ui · Tailwind CSS

This is the primary reference for Claude Code to generate the EQC frontend SPA. All implementation details are in the linked docs below. You do not need to consult `EQC_Frontend_Technical_Spec.md` directly — the docs here cover its entire content.

---

## Quick Reference

| Area | Doc | What it covers |
|------|-----|----------------|
| Architecture & Stack | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Tech stack table, key principles, full folder/file inventory, entry points, extensibility |
| Data Model & Schema | [DATA_MODEL.md](./docs/DATA_MODEL.md) | All 17 DB objects, complete field tables, all ENUMs, object relationships |
| Authentication (MSAL) | [AUTH.md](./docs/AUTH.md) | Azure AD MSAL config, 6-step integration, token interceptor, AuthContext |
| Routing & RBAC | [ROUTING.md](./docs/ROUTING.md) | Full route table, ProtectedRoute, RoleGuard, sidebar nav per role |
| API Integration Layer | [API_LAYER.md](./docs/API_LAYER.md) | axiosInstance, all `src/api/*.ts` functions, error handling, cache strategy |
| Custom Hooks | [HOOKS.md](./docs/HOOKS.md) | All TanStack Query hooks in `src/hooks/` — signatures and invalidation rules |
| TypeScript Types | [TYPES.md](./docs/TYPES.md) | Every interface and union type in `src/types/` with full code |
| Pages & Modules | [PAGES.md](./docs/PAGES.md) | All page components, feature module specs, lifecycle UI, BOM packing UI |
| Dashboards | [DASHBOARDS.md](./docs/DASHBOARDS.md) | All 6 role-gated dashboards — roles, endpoints, key schema fields |
| Reports | [REPORTS.md](./docs/REPORTS.md) | 7 report types, filter panel, data table, export bar, scheduling modal |
| Shared Components | [COMPONENTS.md](./docs/COMPONENTS.md) | Full component library — layout, data, charts, forms, feedback |
| State Management | [STATE.md](./docs/STATE.md) | Two-tier model (TanStack Query + Context), no Redux/Zustand |
| Environment Variables | [ENV_VARS.md](./docs/ENV_VARS.md) | All `VITE_` vars, Zod validation schema in `src/config/env.ts` |
| Testing | [TESTING.md](./docs/TESTING.md) | `src/tests/` structure, MSW handlers, 10-step verification plan |
| Development Roadmap | [ROADMAP.md](./docs/ROADMAP.md) | Sprint plan S1–S6, priorities, extensibility rules |

---

## Architecture Overview

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Data Model

See [DATA_MODEL.md](./docs/DATA_MODEL.md)

## Authentication

See [AUTH.md](./docs/AUTH.md)

## Routing & Role-Based Access Control

See [ROUTING.md](./docs/ROUTING.md)

## API Integration Layer

See [API_LAYER.md](./docs/API_LAYER.md)

## Custom Hooks

See [HOOKS.md](./docs/HOOKS.md)

## TypeScript Types

See [TYPES.md](./docs/TYPES.md)

## Pages & Feature Modules

See [PAGES.md](./docs/PAGES.md)

## Dashboards

See [DASHBOARDS.md](./docs/DASHBOARDS.md)

## Reports

See [REPORTS.md](./docs/REPORTS.md)

## Shared Components

See [COMPONENTS.md](./docs/COMPONENTS.md)

## State Management

See [STATE.md](./docs/STATE.md)

## Environment Variables

See [ENV_VARS.md](./docs/ENV_VARS.md)

## Testing

See [TESTING.md](./docs/TESTING.md)

## Development Roadmap

See [ROADMAP.md](./docs/ROADMAP.md)
