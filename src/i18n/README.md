# HRMS Web i18n

Locale preference is stored in the `NEXT_LOCALE` cookie (`en` | `id`), shared with `/docs`.

## Rules

### Locale routing

App routes **do not** use a `/en` or `/id` URL prefix. Do **not** use `next-intl` `createMiddleware` path rewrites unless pages live under `app/[locale]/` (they do not).

Locale is read from the `NEXT_LOCALE` cookie in `src/i18n/request.ts`. Custom middleware only handles `/docs` redirects and cookie seeding.

### Translation vs formatting

- **Translation** (`next-intl`, `messages/*.json`): UI labels, buttons, nav, validation copy, status display text.
- **Formatting** (`src/lib/formatting/`): numbers, dates, currency display.

### Currency

IDR values **always** use `id-ID` via `formatCurrencyIdr()` regardless of UI language.

### Dates and numbers

Use `formatDate`, `formatDateTime`, `formatNumber` with the active UI locale (`en` → `en-US`, `id` → `id-ID`).

### Status badges

API may return English labels. Map to canonical keys in `src/lib/i18n/status.ts` and render with `StatusBadge` + `status.*` messages.

### API messages

Unknown server strings are shown as-is. Known strings are mapped in `src/lib/i18n/api-messages.ts`.

### Blockers

Log unexpected inconsistencies in `i18n-blockers.md` at repo root when found during migration.
