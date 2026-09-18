import { UserModule } from '@modules/User/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './aut.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  exports: [JwtModule],
  providers: [AuthService],
})
export class AuthModule {}
