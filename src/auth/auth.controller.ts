import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Headers,
  Get,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@ApiTags('auth')
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con Supabase usando email y contraseña. Retorna los tokens de acceso y refresh.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Login exitoso',
    schema: {
      example: {
        success: true,
        code: 201,
        data: {
          user: {
            id: 'uuid-del-usuario',
            email: 'usuario@ejemplo.com',
            role: 'authenticated'
          },
          session: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expires_in: 3600,
            token_type: 'bearer'
          }
        },
        messages: 'Login exitoso'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No se ha podido iniciar sesión - Credenciales inválidas',
    schema: {
      example: {
        status: 403,
        error: 'No se ha podido iniciar sesión'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  async login(@Body() body: LoginDto) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "No se ha podido iniciar sesión",
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        }
      );
    }
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Cierra la sesión del usuario autenticado invalidando el token de acceso en Supabase. El token se extrae automáticamente del header Authorization y es validado por el guard antes de ejecutar la lógica de logout.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Sesión cerrada correctamente',
    schema: {
      example: {
        success: true,
        code: 201,
        message: 'Sesión cerrada correctamente'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o ausente',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al cerrar sesión',
    schema: {
      example: {
        status: 400,
        error: 'Error al cerrar sesión'
      }
    }
  })
  async logout(@Req() req) {
    try {
      return await this.authService.logout(req.token);
    } catch (error: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Error al cerrar sesión',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Retorna la información del perfil del usuario autenticado. Requiere token JWT válido.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario obtenido correctamente',
    schema: {
      example: {
        message: 'Ruta protegida: usuario autenticado',
        user: {
          id: 'uuid-del-usuario',
          email: 'usuario@ejemplo.com',
          aud: 'authenticated',
          role: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o ausente',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized'
      }
    }
  })
  getProfile(@Req() req) {
    return {
      message: 'Ruta protegida: usuario autenticado',
      user: req.user,
    };
  }
}
