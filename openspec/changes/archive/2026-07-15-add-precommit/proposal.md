# Proposal: Add pre-commit hooks

## Intent

Actualmente se puede commitear código que no pasa tests ni lint. Necesitamos git hooks automáticos que ejecuten Biome lint + tests antes de cada commit para mantener la calidad.

## Scope

### In Scope
- Instalar husky + lint-staged
- Hook pre-commit: Biome lint --write en staged files
- Hook pre-commit: backend tests
- Integración con pnpm

### Out of Scope
- hook commit-msg (validar formato)
- CI (ya está configurada)
- Tests de frontend en pre-commit (son lentos)

## Approach

husky 9 configura hooks via `.husky/` directory. lint-staged corre solo en archivos staged. El hook ejecuta: lint (staged) → test (backend).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| root package.json | Modified | Agregar prepare script, lint-staged config |
| .husky/pre-commit | New | Hook file |
| .gitignore | Modified | Ignorar .husky/_ (herramientas internas de husky) |

## Rollback Plan

`pnpm exec husky uninstall` + borrar `.husky/` + revertir package.json.

## Success Criteria

- [ ] `git commit` falla si hay errores de lint
- [ ] `git commit` falla si los tests no pasan
- [ ] `git commit` pasa si todo está bien
