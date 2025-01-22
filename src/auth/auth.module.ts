import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategyService } from './jwt/jwt-strategy.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1000 day',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategyService, OracleService],
})
export class AuthModule {}
