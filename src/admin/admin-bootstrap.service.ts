import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { UserRole, UserStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { PrismaService } from 'src/prima.service'

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name)

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim()
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
    const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || 'Administrador'

    const adminCount = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    })

    if (adminCount > 0) {
      return
    }

    if (!email || !password) {
      this.logger.warn(
        'Nenhum administrador encontrado. Defina ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD para criar o primeiro acesso.',
      )
      return
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      })

      this.logger.log(`Usuário ${email} promovido a administrador.`)
      return
    }

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 8),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    })

    this.logger.log(`Administrador inicial criado: ${email}`)
  }
}
