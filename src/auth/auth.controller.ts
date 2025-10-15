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
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
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
  async logout(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader) {
        throw new HttpException('Falta el token de autorización', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.replace('Bearer ', '').trim();

      return await this.authService.logout(token);
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
  getProfile(@Req() req) {
    return {
      message: 'Ruta protegida: usuario autenticado',
      user: req.user,
    };
  }
}
