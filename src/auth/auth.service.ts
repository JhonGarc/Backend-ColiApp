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
    console.log('Realizando login para email:', email);
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

    
      const segments = accessToken.split('.');
      if (segments.length !== 3) {
        throw new HttpException(
          `Token malformado. Tiene ${segments.length} segmentos, se esperan 3`,
          HttpStatus.BAD_REQUEST
        );
      }
      
      const adminClient = createSupabaseAdminClient(this.configService);
      
      const { data: userData, error: userError } = await adminClient.auth.getUser(accessToken);
      
      if (userError || !userData?.user) {
        console.error('Error al obtener usuario:', userError);
        throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
      }

      console.log('Usuario encontrado:', userData.user.email);

    
      let sessionId: string | null = null;
      try {
        const payload = JSON.parse(Buffer.from(segments[1], 'base64').toString());
        sessionId = payload.session_id || null;
        console.log('Session ID extraído del token:', sessionId);
      } catch (decodeError) {
        console.error('Error al decodificar token:', decodeError);
      }

      const { error: deleteError } = await adminClient.rpc('delete_user_session', {
        user_id_param: userData.user.id,
        session_id_param: sessionId
      });
      
      if (deleteError) {
        console.error('Error al eliminar sesión:', deleteError);
        throw new HttpException(
          'Error al cerrar sesión en el servidor',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log('Sesión eliminada para:', userData.user.email);

      return {
        success: true,
        code: 200,
        message: 'Sesión cerrada correctamente',
      };
    } catch (error: any) {
      console.error('Error en logout:', error);
      throw new HttpException(
        { error: error.message || 'Error al cerrar sesión' },
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
}