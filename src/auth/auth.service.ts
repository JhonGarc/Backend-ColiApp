import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient, createSupabaseAdminClient } from '../providers/supabase/supabase';

@Injectable()
export class AuthService {
  private supabase: any;

  constructor(private configService: ConfigService) {
    this.supabase = createSupabaseClient(this.configService);
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      return {
        success: true,
        code: 200,
        data: data,
        messages: 'Login exitoso',
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new HttpException(
        {
          error: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

async logout(accessToken: string) {
  try {

    const userClient = createSupabaseClient(this.configService, accessToken);
    const { error: signOutError } = await userClient.auth.signOut();
    if (signOutError) throw signOutError;
    return {
      success: true,
      code: 200,
      message: 'Sesión cerrada correctamente',
    };
  } catch (error: any) {
    console.error('Error en logout:', error);
    throw new HttpException(
      { error: error.message || 'Error desconocido' },
      error.status || HttpStatus.BAD_REQUEST
    );
  }
}

}