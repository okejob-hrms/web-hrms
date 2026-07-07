# i18n migration blockers

Track unexpected inconsistencies discovered during EN/ID rollout.

| Date | Area | Issue | Classification | Resolution |
|------|------|-------|----------------|------------|
| — | API status | Backend returns English labels from PHP helpers | Contract | FE maps via `lib/i18n/status.ts`; backend partial `__()` in AttendanceHelper |
| — | Branch settings | `IBranchSettings.language` not wired to UI | Display-only | Deferred until branch settings read on boot |
| — | Mixed status types | Some modules use numeric codes, others English strings | Contract | `resolveStatusKey` + numeric resolvers per domain |
