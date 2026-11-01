# AGENTS

Operation Center Lite is an MDK app: one package with a Gateway plugin (`plugin/`) and a dashboard UI (`ui-src/`, built to `ui/`). Dashboards install it with `mdk add app github:<owner>/<repo>#<tag>` and serve its pages under `/app/<name>/`. Read `README.md` for the layout and the dev loop.

## Completion requirements

- `npm run fmt:check`, `npm run lint`, `npm run typecheck` and `npm test` must pass before a task is complete.
- After any change under `ui-src/`, run `npm run build:ui` and commit `ui/`. GitHub installs run no build, so a stale `ui/` ships stale code. CI fails when `ui/` does not match a fresh build.
- After any change to the routes, run `npm run gen:routes` and commit `plugin/mdk-plugin.json`. Never edit that file by hand.
- `npm run validate` (`mdk validate app`) must pass. It checks the manifest, the route table and the built UI bundle.
- For UI changes, run the dev stack and the dashboard and look at the page before calling it done.

## Working rules

- Build with MDK as it ships: public docs, the Agent Skills (`npm run mdk -- skill add --dir .`), the CLI, and the devkit components. When MDK gets in the way, work around it in the smallest way and log the friction for the MDK team. Do not patch MDK packages from here.
- The contract lives in `ui-src/api/contract.ts` as zod schemas: every request and response body, with the unit in every numeric field name (`hashrateThs`, `powerW`, `inletTempC`). The UI parses every response with it, the route table is generated from it, and `api/contract.test.ts` checks the plugin's mock site against it. Change the contract first, then the plugin and the UI.
- Shared value lists (power modes, statuses, ranges) are `as const` tuples in the contract, with the types derived from them. Do not repeat them anywhere else.
- Use discriminated unions when behavior depends on a key (view states, history by metric). Hooks return a view union (`loading | error | ready`), never raw query state.
- Build objects explicitly, with `if` statements, instead of conditional spreads like `...(condition ? { foo } : {})`.
- Avoid `any`, unchecked casts and loose `Record<string, unknown>` shapes for known payloads. Parse unknown input with a schema or a type guard.
- Prefer correctness and safety over convenience when a tradeoff is required.

## UI (`ui-src/`)

- Layers per feature, under `features/<feature>/`: a data request in `api/` (`getParsed` / `postParsed` with a contract schema), a hook that shapes it into a view, a presentational component that only renders, and a thin page. Components never fetch.
- Resolve every route with `useMdkApp().apiUrl(API_ROUTES.X)`. The installed name is the operator's choice, so never hardcode `/apps/op-centre-lite`.
- Import `useQuery` and app hooks from `@tetherto/mdk-react-adapter`, UI from `@tetherto/mdk-react-devkit` (root import only), and `mdkFetch` from `@tetherto/mdk-ui-foundation`. Those, react, react-dom, react-router and react-query are lent by the dashboard at runtime and stay external. Anything else gets bundled.
- Use devkit components with the props listed in the skill's `ui-registry.json`. Build custom UI only where the devkit has no component, and keep it presentational.
- Pages render inside `components/page.tsx`. Paths are in `app-routes.ts`, and routes are registered in `index.tsx`. Deep links use `hidden: true`.
- Styles go in `styles.css` under the `op-centre-lite-` block, using the MDK design tokens.
- Files are kebab-case.

## Plugin (`plugin/`)

- Controllers are `async (req) => body` and read the site from `lib/site-source.js`. That module serves the in-memory mock (`lib/mock-site.js`) when the app config has `mock: true`, and the workers otherwise.
- Throw `httpError("ERR_SCREAMING_SNAKE", status)` from `lib/errors.js`. The Gateway answers with `{ statusCode, error, message }`. Declare each code under the route's `errors` in `ui-src/api/route-table.ts`.
- Write routes check `assertCommandsEnabled()` first, so the hosted demo (`commandsEnabled: false`) returns 403.
