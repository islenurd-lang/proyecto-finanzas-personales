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

### 9.1 — Schema y auth base (actual)
- [x] UserRole enum (SUPER_ADMIN, USER)
- [x] User.passwordHash, role, isActive, lastLoginAt
- [x] bcryptjs para hashing
- [x] Auth service: validateUserCredentials
- [x] Current-user helper (temporal, usa demo user)
- [x] Seed con admin + demo user hasheados

### 9.2 — Login, logout, sesión segura
- [ ] Página /login
- [ ] JWT con jose + HTTP-only cookies
- [ ] Middleware de protección de rutas
- [ ] getCurrentUser desde sesión real
- [ ] Logout endpoint
- [ ] Redirect no autenticados a /login

### 9.3 — Panel admin de usuarios
- [ ] Página /admin/users (solo SUPER_ADMIN)
- [ ] Crear usuario
- [ ] Activar/desactivar usuario
- [ ] Lista de usuarios
- [ ] No acceso a datos financieros de otros

### 9.4 — Aislamiento userId en todos los services
- [ ] Reemplazar getDemoUser() por requireCurrentUser()
- [ ] Auditar cada service para usar userId del usuario autenticado
- [ ] Verificar que CSV export filtra por userId
- [ ] Verificar dashboard, reports, settings por userId

### 9.5 — Pruebas cruzadas
- [ ] Crear usuario A y usuario B
- [ ] Verificar que A no ve datos de B
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
