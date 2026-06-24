# Checklist del Proyecto

## Local

- [x] `npm install` exitoso
- [x] `npx prisma validate` — schema válido
- [x] `npx prisma generate` — client generado
- [x] `npx prisma migrate dev` — migraciones aplicadas
- [x] `npx prisma db seed` — datos demo cargados
- [x] `npm run lint` — sin errores
- [x] `npm run build` — exitoso
- [x] `npm run dev` — app funciona en localhost
- [x] Dashboard muestra datos reales
- [x] CRUD cuentas funciona
- [x] CRUD categorías funciona
- [x] CRUD transacciones con reglas financieras
- [x] CRUD presupuestos con consumo calculado
- [x] CRUD metas de ahorro con progreso
- [x] CRUD deudas con pagos atómicos
- [x] Reportes con gráficos y filtros
- [x] Export CSV funciona
- [x] Settings con tema claro/oscuro
- [x] Health endpoint responde OK

## GitHub

- [ ] `.gitignore` actualizado
- [ ] `.env.example` con placeholders seguros
- [ ] `.env` NO incluido en repositorio
- [ ] README.md completo
- [ ] CI workflow en `.github/workflows/ci.yml`
- [ ] Commit inicial limpio
- [ ] Push a repositorio

## Seguridad

- [x] No hay secretos en código
- [x] `.env` ignorado por Git
- [x] No hay credenciales bancarias
- [x] No hay integración bancaria real
- [x] Validación server-side con Zod
- [x] Balances calculados (no almacenados)
- [x] Pagos atómicos con $transaction
- [x] CSV no expone secretos
- [x] Health endpoint no expone internals

## Railway (futuro)

- [ ] Migrar a PostgreSQL
- [ ] Cambiar adapter a @prisma/adapter-pg
- [ ] Configurar DATABASE_URL en Railway
- [ ] Ejecutar prisma migrate deploy
- [ ] Verificar /api/health
- [ ] Configurar dominio

## Producción (futuro)

- [ ] Implementar autenticación real
- [ ] Multiusuario
- [ ] Backups automáticos
- [ ] Monitoreo y alertas
- [ ] Rate limiting
- [ ] HTTPS
- [ ] Logs estructurados
