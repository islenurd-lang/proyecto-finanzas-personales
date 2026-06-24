# Proyecto Finanzas Personales

App web moderna de finanzas personales para registrar, organizar, analizar y controlar ingresos, gastos, cuentas, presupuestos, metas de ahorro y deudas.

**Estado:** MVP v0.1.0 — funcional en local con datos demo.

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework fullstack (App Router) |
| React 19 | Interfaz de usuario |
| TypeScript | Tipado estático |
| Tailwind CSS v4 | Estilos |
| Prisma 7 | ORM |
| SQLite (libSQL) | Base de datos local |
| Recharts | Gráficos |
| Zod | Validación de datos |
| React Hook Form | Formularios |

## Módulos

- **Dashboard** — Balance total, ingresos/gastos del mes, flujo neto, gráficos, alertas de presupuesto
- **Cuentas** — CRUD con tipos (efectivo, banco, tarjeta, ahorro, préstamo), balances calculados
- **Categorías** — Ingresos y gastos, colores, íconos, activar/inactivar
- **Transacciones** — Ingresos, gastos y transferencias con reglas financieras, filtros, formulario dinámico
- **Presupuestos** — Mensuales por categoría, consumo calculado desde transacciones, progress bars
- **Metas de Ahorro** — Progreso porcentual, cuenta asociada opcional, estados visuales
- **Deudas** — CRUD con estados (activa/pagada/vencida), pagos atómicos que crean transacciones
- **Reportes** — Gráficos mensuales, gastos por categoría, evolución del balance, comparación mensual, filtros avanzados
- **Export CSV** — Endpoint `/api/export/transactions` con filtros por query params
- **Configuración** — Moneda (DOP/USD/EUR), formato de fecha, tema claro/oscuro/sistema
- **Health Check** — `GET /api/health`

## Requisitos

- Node.js >= 20
- npm >= 10
- Git

## Instalación

```bash
# Clonar repositorio
git clone <url-del-repo>
cd proyecto-finanzas-personales

# Instalar dependencias (genera Prisma Client automáticamente)
npm install

# Copiar variables de entorno
cp .env.example .env
# En Windows PowerShell:
# Copy-Item .env.example .env
```

## Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar datos demo
npx prisma db seed
```

## Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:validate` | Validar schema Prisma |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:migrate` | Migración de desarrollo |
| `npm run db:deploy` | Migración de producción |
| `npm run db:seed` | Poblar datos demo |
| `npm run db:studio` | Prisma Studio (GUI) |

## Validación

```bash
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

## Export CSV

```
GET /api/export/transactions
GET /api/export/transactions?type=EXPENSE&categoryId=xxx&dateFrom=2026-06-01&dateTo=2026-06-30
```

Retorna `text/csv` con columnas: Fecha, Tipo, Estado, Cuenta Origen, Cuenta Destino, Categoría, Descripción, Monto, Moneda.

## Seguridad

- No se conectan bancos ni APIs financieras reales
- No se guardan credenciales bancarias
- Datos almacenados localmente en SQLite
- Variables sensibles excluidas del repositorio (`.env` en `.gitignore`)
- Validación server-side con Zod en todas las operaciones
- Balances calculados desde transacciones (no almacenados manualmente)
- Pagos de deuda atómicos con `prisma.$transaction()`

## Migración futura a PostgreSQL / Railway

1. Cambiar `provider` en `prisma/schema.prisma` de `sqlite` a `postgresql`
2. Cambiar adapter de `@prisma/adapter-libsql` a `@prisma/adapter-pg`
3. Configurar `DATABASE_URL` con connection string de PostgreSQL
4. Ejecutar `npx prisma migrate deploy` en producción
5. Configurar variables de entorno en Railway
6. Ver [docs/RAILWAY.md](docs/RAILWAY.md) para guía detallada

## Roadmap

- [ ] Autenticación real (JWT + bcrypt)
- [ ] Migración a PostgreSQL
- [ ] Deploy en Railway
- [ ] Multiusuario
- [ ] Backups automáticos
- [ ] Monitoreo y alertas
- [ ] PWA / Mobile

---

Desarrollado con Next.js 16, TypeScript y Prisma.
