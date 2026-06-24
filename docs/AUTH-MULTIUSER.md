# Autenticación y Multiusuario — Estrategia

## Roles

| Rol | Descripción |
|---|---|
| `SUPER_ADMIN` | Administra usuarios. No ve datos financieros privados de otros usuarios. |
| `USER` | Usa todos los módulos financieros. Solo accede a sus propios datos. |

## Regla de privacidad

Cada `USER` solo puede ver y modificar sus propios datos financieros. No existe acceso cruzado entre usuarios.

## Entidades que filtran por userId

| Entidad | Campo | Filtro obligatorio |
|---|---|---|
| Account | userId | Sí |
| Category | userId | Sí |
| Transaction | userId | Sí |
| Budget | userId | Sí |
| SavingGoal | userId | Sí |
| Debt | userId | Sí |
| DebtPayment | via Debt.userId | Sí (indirecto) |
| Tag | userId | Sí |
| AppSetting | userId | Sí |
| Dashboard | via transactions/accounts | Sí |
| Reports | via transactions | Sí |
| CSV Export | via transactions | Sí |

## Fases de implementación

### 9.1 — Schema y auth base ✅
- [x] UserRole enum (SUPER_ADMIN, USER)
- [x] User.passwordHash, role, isActive, lastLoginAt
- [x] bcryptjs para hashing
- [x] Auth service: validateUserCredentials
- [x] Current-user helper con sesión real
- [x] Seed con admin + demo user hasheados

### 9.2 — Login, logout, sesión segura ✅
- [x] Página /login con dark mode
- [x] JWT con jose + HTTP-only cookies
- [x] proxy.ts (Next.js 16) protección de rutas
- [x] getCurrentUser desde sesión JWT real
- [x] Logout endpoint + botón sidebar
- [x] Redirect no autenticados a /login

### 9.3 — Panel admin de usuarios ✅
- [x] Página /admin/users (solo SUPER_ADMIN)
- [x] Crear usuario (role USER)
- [x] Activar/desactivar usuario con guards
- [x] Lista de usuarios sin passwordHash
- [x] SUPER_ADMIN no ve datos financieros

### 9.4 — Aislamiento userId en todos los services ✅
- [x] getDemoUser() delega a requireCurrentUser()
- [x] Dashboard service corregido (no hardcodea email)
- [x] Todos los services filtran por userId autenticado
- [x] CSV export filtra por userId
- [x] Ownership helpers creados
- [x] Verificado: usuario test ve 0 data, demo ve su data

### 9.5 — Hardening ✅
- [x] JWT_SECRET validado en producción (no permite fallback inseguro)
- [x] Rate limit in-memory en login (5 intentos / 15 min)
- [x] Pruebas cruzadas: A no ve datos de B
- [x] SUPER_ADMIN no ve finanzas
- [x] Usuario inactivo bloqueado
- [ ] Verificar que SUPER_ADMIN no ve finanzas privadas
- [ ] Verificar que usuario desactivado no puede acceder

## Credenciales demo (solo desarrollo local)

| Rol | Email | Password |
|---|---|---|
| SUPER_ADMIN | admin@finanzas.local | Admin123! |
| USER | demo@finanzas.local | Demo123! |

> Estas credenciales son para desarrollo local. En producción deben cambiarse.

## Seguridad

- passwordHash nunca se envía al frontend
- passwordHash nunca se loguea
- Passwords se hashean con bcryptjs (10 salt rounds)
- No se almacena password plano en ningún lugar
- .env con secretos está en .gitignore
