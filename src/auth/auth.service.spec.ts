import { PrismaService } from '@/database/prisma.service'
import { UsersService } from '@/users/users.service'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { JwtStrategyService } from './jwt/jwt-strategy.service'

describe('AuthService', () => {
  let service: AuthService

  let serviceUsers: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '1 day',
          },
        }),
      ],
      providers: [AuthService, PrismaService, JwtStrategyService],
    }).compile()

    service = module.get<AuthService>(AuthService)

    const usersModule: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile()

    serviceUsers = usersModule.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should return access_token', async () => {
      await serviceUsers.create({
        name: 'John Doe Auth Test',
        email: 'johndoe@authtest.com',
        permissions: [],
        role: 'engineer',
      })

      const session = await service.create({
        email: 'johndoe@authtest.com',
        password: 'buhatem@123',
      })

      expect(session.access_token).toBeDefined()
    })
  })
})
