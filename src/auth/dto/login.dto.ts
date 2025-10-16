import { IsNotEmpty, IsString, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        description: 'Email del usuario registrado en Supabase',
        example: 'usuario@ejemplo.com',
        type: String,
    })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'Password123!',
        type: String,
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}