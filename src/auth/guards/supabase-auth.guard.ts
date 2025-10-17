import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabaseAdmin;

  constructor(private readonly configService: ConfigService) {

    const supabaseUrl = this.configService.get<string>('supabase.url')!;
    const supabaseServiceKey = this.configService.get<string>('supabase.serviceKey')!;

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
     
    
    const authHeader = request.headers['authorization'];

    
    if (!authHeader) {
      console.log('No se encontró el header Authorization');
      throw new UnauthorizedException('Falta el token de autorización');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Token extraído:', token.substring(0, 20) + '...');

    try {
      const { data, error } = await this.supabaseAdmin.auth.getUser(token);

      if (error || !data?.user) {
        throw new UnauthorizedException('Token inválido, expirado o sesión cerrada');
      }

      request.user = data.user;
      request.token = token;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido, expirado o sesión cerrada');
    }
  }
}


