# Deploy en Railway — Guía futura

> Estado: preparación documentada. No desplegado todavía.

## Requisitos previos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub conectado
- MVP local funcionando con `npm run build` exitoso

## Pasos para deploy

### 1. Crear proyecto en Railway

- Ir a Railway Dashboard
- New Project → Deploy from GitHub repo
- Seleccionar el repositorio

### 2. Agregar PostgreSQL

- En el proyecto, agregar servicio → PostgreSQL
- Railway genera automáticamente `DATABASE_URL`

### 3. Migrar de SQLite a PostgreSQL

Antes de deploy, actualizar el proyecto:

1. Cambiar `provider` en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Cambiar adapter en `src/lib/prisma.ts` y `prisma/seed.ts`:
   - De `@prisma/adapter-libsql` a `@prisma/adapter-pg`
   - Instalar: `npm install @prisma/adapter-pg pg`

3. Generar nueva migración:
   ```bash
   npx prisma migrate dev --name migrate-to-postgres
   ```

### 4. Configurar variables de entorno

En Railway Settings → Variables:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | (automático de Railway PostgreSQL) |
| `APP_URL` | URL del servicio Railway |
| `JWT_SECRET` | Generar valor seguro cuando se implemente auth |

### 5. Configurar build/start

En Railway Settings:

- **Build Command:** `npm run build`
- **Start Command:** `npm run start`

### 6. Ejecutar migraciones

En Railway terminal o como release command:

```bash
npx prisma migrate deploy
```

### 7. Seed inicial (opcional)

```bash
npx prisma db seed
```

### 8. Verificar

- Abrir URL del servicio
- Verificar `GET /api/health` responde `{"status":"ok"}`
- Verificar dashboard carga con datos

### 9. Dominio personalizado (opcional)

- En Settings → Networking → Custom Domain
- Configurar DNS

## Notas

- El MVP actual usa SQLite local; PostgreSQL requiere cambios en adapter y provider
- No subir `.env` al repositorio
- Usar variables de entorno de Railway para secretos
- `postinstall` ejecuta `prisma generate` automáticamente en deploy
