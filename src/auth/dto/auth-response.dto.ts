import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-del-usuario', description: 'ID único del usuario' })
  id: string;

  @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Email del usuario' })
  email: string;

  @ApiProperty({ example: 'authenticated', description: 'Rol del usuario' })
  role: string;
}

export class SessionResponseDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'Token de acceso JWT' 
  })
  access_token: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'Token de refresco' 
  })
  refresh_token: string;

  @ApiProperty({ example: 3600, description: 'Tiempo de expiración en segundos' })
  expires_in: number;

  @ApiProperty({ example: 'bearer', description: 'Tipo de token' })
  token_type: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: true, description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'Código de estado HTTP' })
  code: number;

  @ApiProperty({ 
    type: () => ({
      user: UserResponseDto,
      session: SessionResponseDto
    }),
    description: 'Datos del usuario y la sesión' 
  })
  data: {
    user: UserResponseDto;
    session: SessionResponseDto;
  };

  @ApiProperty({ example: 'Login exitoso', description: 'Mensaje de respuesta' })
  messages: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true, description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'Código de estado HTTP' })
  code: number;

  @ApiProperty({ example: 'Sesión cerrada correctamente', description: 'Mensaje de respuesta' })
  message: string;
}

export class ProfileResponseDto {
  @ApiProperty({ 
    example: 'Ruta protegida: usuario autenticado', 
    description: 'Mensaje de confirmación' 
  })
  message: string;

  @ApiProperty({ 
    type: UserResponseDto,
    description: 'Información del usuario autenticado' 
  })
  user: UserResponseDto;
}
