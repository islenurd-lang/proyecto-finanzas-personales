# Deploy en Railway

## Requisitos previos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub
- Rama `chore/railway-postgres-auth-readiness` o main con PostgreSQL

## Deploy paso a paso

### 1. Crear proyecto en Railway

Railway Dashboard → New Project → Deploy from GitHub repo → seleccionar `proyecto-finanzas-personales`

### 2. Agregar PostgreSQL

Add Service → PostgreSQL → Railway genera `DATABASE_URL` automáticamente

### 3. Configurar variables de entorno

Settings → Variables:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Automático desde PostgreSQL service |
| `JWT_SECRET` | Generar valor seguro: `openssl rand -base64 32` |
| `APP_URL` | URL del servicio Railway |

### 4. Deploy automático

`railway.json` configura:

- **Build:** `npm run build` (incluye `postinstall: prisma generate`)
- **Pre-deploy:** `npm run db:deploy` (ejecuta `prisma migrate deploy`)
- **Start:** `npm run start`
- **Health check:** `/api/health`

### 5. Seed inicial (primera vez)

En Railway terminal:

```bash
npx prisma db seed
```

Esto crea:
- admin@finanzas.local (SUPER_ADMIN) / Admin123!
- demo@finanzas.local (USER) / Demo123!

> ⚠️ Cambiar credenciales antes de uso comercial real.

### 6. Verificar

1. `GET /api/health` → `{"status":"ok","app":"Proyecto Finanzas Personales"}`
2. Abrir `/login`
3. Login como admin → ver `/admin/users`
4. Login como demo → ver `/dashboard` con datos
5. Verificar que admin no ve datos financieros
6. Verificar logout funciona

### 7. Dominio personalizado

Settings → Networking → Custom Domain → Configurar DNS

## Arquitectura

```
GitHub Push → Railway Build (npm run build)
           → Pre-deploy (prisma migrate deploy)
           → Start (npm run start)
                    ↓
            PostgreSQL (Railway)
                    ↓
            /api/health ← Health check
```

## Funcionalidad incluida

- Autenticación JWT con cookies HTTP-only
- Roles: SUPER_ADMIN (admin usuarios) / USER (finanzas)
- Aislamiento de datos por userId
- Rate limiting en login
- 11 módulos financieros
- Export CSV protegido por sesión
- Dark mode
- Responsive

## Seguridad

- `JWT_SECRET` debe ser único y seguro en producción
- No subir `.env` al repositorio
- `postinstall` ejecuta `prisma generate` automáticamente
- Credenciales demo deben cambiarse antes de producción comercial
- passwordHash nunca se expone al frontend
