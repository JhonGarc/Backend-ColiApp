# Documentación Swagger - ColiApp API

## 📚 Acceso a la documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api/docs
```

## 🔐 Endpoints de Autenticación

### 1. POST /auth/login
**Descripción:** Inicia sesión con email y contraseña

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "user": {
      "id": "uuid-del-usuario",
      "email": "usuario@ejemplo.com",
      "role": "authenticated"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "bearer"
    }
  },
  "messages": "Login exitoso"
}
```

### 2. POST /auth/logout
**Descripción:** Cierra la sesión del usuario autenticado

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "code": 200,
  "message": "Sesión cerrada correctamente"
}
```

### 3. GET /auth/profile
**Descripción:** Obtiene el perfil del usuario autenticado (ruta protegida)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "message": "Ruta protegida: usuario autenticado",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "aud": "authenticated",
    "role": "authenticated",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔑 Cómo usar la autenticación en Swagger

1. **Login:** Primero, usa el endpoint `/auth/login` para obtener el `access_token`
2. **Autorizar:** Haz clic en el botón **"Authorize"** 🔓 en la parte superior de Swagger
3. **Ingresar token:** Pega el `access_token` (sin el prefijo "Bearer")
4. **Probar rutas protegidas:** Ahora puedes probar `/auth/profile` y otras rutas protegidas

## 🚀 Iniciar el servidor

```bash
npm run start:dev
```

## 📦 Dependencias de Swagger instaladas

```json
{
  "@nestjs/swagger": "^latest",
  "swagger-ui-express": "^latest"
}
```

## 🛠️ Configuración adicional

La configuración de Swagger se encuentra en `src/main.ts` e incluye:
- Título y descripción de la API
- Versión de la API
- Tags para agrupar endpoints
- Configuración de Bearer Auth (JWT)

## 📝 Decoradores utilizados

- `@ApiTags()` - Agrupa endpoints relacionados
- `@ApiOperation()` - Describe la operación del endpoint
- `@ApiResponse()` - Documenta las posibles respuestas
- `@ApiBearerAuth()` - Indica que requiere autenticación JWT
- `@ApiHeader()` - Documenta headers requeridos
- `@ApiBody()` - Documenta el cuerpo de la petición
- `@ApiProperty()` - Documenta propiedades de DTOs

## 🎯 Próximos pasos

A medida que agregues más módulos (envíos, usuarios, etc.), recuerda:
1. Crear DTOs con decoradores `@ApiProperty()`
2. Documentar controladores con decoradores de Swagger
3. Agregar tags nuevos en `main.ts` si es necesario
4. Documentar todas las respuestas posibles con `@ApiResponse()`

## 📖 Documentación oficial

- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
