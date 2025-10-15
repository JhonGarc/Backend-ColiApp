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
  private supabase;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url')!;
    const supabaseKey = this.configService.get<string>('supabase.key')!;

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Falta el token de autorización');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Verificamos el token con Supabase
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Guardamos el usuario en la request (útil para los controladores)
    request.user = data.user;

    return true;
  }
}
