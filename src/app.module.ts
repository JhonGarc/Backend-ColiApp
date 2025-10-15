import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";
import { EnvConfiguration } from "./common/config/env.config";
@Module({
  imports: [
      ConfigModule.forRoot({
      load: [EnvConfiguration],
    }),
    AuthModule],
})
export class AppModule {}
