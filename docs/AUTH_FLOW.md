# 🔐 Flujo de Autenticación - ColiApp

## 📋 Resumen

Este documento explica cómo funciona la autenticación en ColiApp usando Supabase y Guards de NestJS.

## 🔄 Flujo de Autenticación Completo

### 1️⃣ Login (POST /auth/login)

**Sin autenticación previa requerida**

```
Cliente → Controller → Service → Supabase
   ↓          ↓          ↓           ↓
 {email,   Valida    signIn    Retorna
password}   DTO      WithPass   tokens
```

**Request:**
```json
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_in": 3600,      // Duración: 1 hora
      "expires_at": 1760645861 // Timestamp Unix
    }
  }
}
```

---

### 2️⃣ Logout (POST /auth/logout)

**Requiere autenticación mediante Guard**

```
Cliente → Guard → Controller → Service → Supabase
   ↓        ↓         ↓           ↓          ↓
Header   Valida   Usa req.   signOut()   Invalida
Bearer    token    token                   token
```

**Request:**
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Por qué se necesita el token si ya está en el header?**

1. **El header es necesario** para que el Guard valide la autenticación
2. **El Guard extrae y valida** el token automáticamente
3. **El Guard guarda** el token en `req.token` para usarlo después
4. **El Service necesita** el token para hacer `signOut()` en Supabase

**Flujo detallado:**

```typescript
// 1. El Guard intercepta la request
SupabaseAuthGuard.canActivate() {
  // Extrae: "Bearer eyJhbGc..." → "eyJhbGc..."
  const token = authHeader.replace('Bearer ', '').trim();
  
  // Valida con Supabase
  const { data, error } = await supabase.auth.getUser(token);
  
  // Si es válido, guarda en request
  request.user = data.user;
  request.token = token; // ← Guardamos el token
  
  return true; // Permite continuar
}

// 2. El Controller ejecuta
async logout(@Req() req) {
  // Usa el token que guardó el guard
  return await this.authService.logout(req.token);
}

// 3. El Service invalida el token
async logout(accessToken: string) {
  const userClient = createSupabaseClient(this.config, accessToken);
  await userClient.auth.signOut(); // ← Necesita el token
}
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Sesión cerrada correctamente"
}
```

---

### 3️⃣ Profile (GET /auth/profile)

**Requiere autenticación mediante Guard**

```
Cliente → Guard → Controller
   ↓        ↓         ↓
Header   Valida   Retorna
Bearer    token    req.user
```

**Request:**
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Ruta protegida: usuario autenticado",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "aud": "authenticated",
    "role": "authenticated"
  }
}
```

---

## 🛡️ SupabaseAuthGuard

### ¿Qué hace el Guard?

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // 1. Verifica que exista el header
    if (!authHeader) {
      throw new UnauthorizedException('Falta el token');
    }

    // 2. Extrae el token limpio
    const token = authHeader.replace('Bearer ', '').trim();

    // 3. Valida con Supabase
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Token inválido');
    }

    // 4. Guarda en la request para usar después
    request.user = data.user;   // Datos del usuario
    request.token = token;       // Token original

    return true; // ✅ Permite continuar
  }
}
```

### Ventajas de usar Guards:

✅ **Validación automática** del token antes de ejecutar la lógica  
✅ **Consistencia** en todos los endpoints protegidos  
✅ **Centralización** de la lógica de autenticación  
✅ **Errores 401** automáticos si el token es inválido  
✅ **Datos del usuario** disponibles en `req.user`  
✅ **Token disponible** en `req.token` sin extraer manualmente  

---

## 🔑 Campos de Expiración del Token

### `expires_in` vs `expires_at`

| Campo | Tipo | Valor de ejemplo | Significado |
|-------|------|------------------|-------------|
| `expires_in` | Duración relativa (segundos) | 3600 | "El token dura 1 hora" |
| `expires_at` | Timestamp absoluto (Unix) | 1760645861 | "Expira el 16/10/2025 20:57:41 UTC" |

### Ejemplos de uso:

```typescript
// Usando expires_in (temporizador relativo)
setTimeout(() => {
  console.log('Token expirado, renovar');
}, expires_in * 1000);

// Usando expires_at (timestamp absoluto)
const now = Math.floor(Date.now() / 1000);
if (now >= expires_at) {
  console.log('El token ya expiró');
}

// Calcular tiempo restante
const secondsRemaining = expires_at - now;
console.log(`Quedan ${secondsRemaining} segundos`);
```

### ⏰ Recomendación de renovación:

```typescript
// Renovar 5 minutos antes de que expire
const RENEWAL_BUFFER = 300; // 5 minutos
const timeUntilRenewal = expires_at - Math.floor(Date.now()/1000) - RENEWAL_BUFFER;

if (timeUntilRenewal > 0) {
  setTimeout(() => refreshToken(), timeUntilRenewal * 1000);
}
```

---

## 📊 Comparación: Con Guard vs Sin Guard

### ❌ Sin Guard (Forma antigua):

```typescript
@Post('logout')
async logout(@Headers('authorization') authHeader: string) {
  // Validación manual
  if (!authHeader) {
    throw new HttpException('Falta token', 401);
  }
  
  // Extracción manual
  const token = authHeader.replace('Bearer ', '').trim();
  
  // NO se valida con Supabase aquí
  
  return await this.authService.logout(token);
}
```

**Problemas:**
- ❌ No valida si el token es realmente válido
- ❌ Código duplicado en cada endpoint
- ❌ No es consistente con otros endpoints

### ✅ Con Guard (Forma actual):

```typescript
@Post('logout')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('JWT-auth')
async logout(@Req() req) {
  // El guard ya validó todo
  return await this.authService.logout(req.token);
}
```

**Ventajas:**
- ✅ Token validado automáticamente con Supabase
- ✅ Código limpio y conciso
- ✅ Consistente con `/auth/profile`
- ✅ Documentación Swagger automática

---

## 🎯 Mejores Prácticas

### 1. Usa Guards en todas las rutas protegidas
```typescript
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('JWT-auth')
```

### 2. Accede al usuario desde req.user
```typescript
getProfile(@Req() req) {
  return req.user; // Datos del usuario
}
```

### 3. Accede al token desde req.token
```typescript
logout(@Req() req) {
  return this.authService.logout(req.token);
}
```

### 4. No extraigas manualmente el token del header
```typescript
// ❌ Evita esto
const token = authHeader.replace('Bearer ', '').trim();

// ✅ Usa esto
req.token
```

---

## 🔒 Seguridad

### El Guard valida:
1. ✅ Que el header `Authorization` exista
2. ✅ Que el formato sea correcto (`Bearer token`)
3. ✅ Que el token sea válido en Supabase
4. ✅ Que el token no haya expirado
5. ✅ Que el usuario exista

### Si falla cualquier validación:
→ Lanza `UnauthorizedException` (HTTP 401)  
→ No ejecuta la lógica del controller  
→ Retorna error automático al cliente  

---

## 📚 Referencias

- [NestJS Guards](https://docs.nestjs.com/guards)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
