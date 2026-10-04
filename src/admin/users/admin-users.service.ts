import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, UserRole, UserStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { buildPaginatedResult, resolvePagination } from 'src/common/pagination'
import { PrismaService } from 'src/prima.service'
import { AUDIT_ACTIONS, AdminAuditService } from '../admin-audit.service'
import { CreateAdminUserDto } from './dto/create-admin-user.dto'
import { ListAdminUsersDto } from './dto/list-admin-users.dto'
import { UpdateAdminUserDto } from './dto/update-admin-user.dto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function omitPassword<T extends { password: string }>(user: T) {
  const { password, ...rest } = user
  return rest
}

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async list(query: ListAdminUsersDto) {
    const { page, perPage, skip, take } = resolvePagination(query)
    const search = query.search?.trim()

    const where: Prisma.UserWhereInput = {}

    if (query.role) {
      where.role = query.role
    }

    if (query.status) {
      where.status = query.status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search.replace(/\D/g, '') } },
      ]
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return buildPaginatedResult(users.map(omitPassword), total, page, perPage)
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return omitPassword(user)
  }

  async create(actorId: string, dto: CreateAdminUserDto) {
    const name = dto.name?.trim()
    const email = dto.email?.trim().toLowerCase()
    const password = dto.password
    const role = dto.role
    const cpf = dto.cpf?.replace(/\D/g, '') || null

    if (!name) {
      throw new BadRequestException('Informe o nome')
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new BadRequestException('Informe um e-mail válido')
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres')
    }

    if (role !== UserRole.ADMIN && role !== UserRole.DOCTOR) {
      throw new BadRequestException('Perfil inválido')
    }

    if (role === UserRole.DOCTOR && !cpf) {
      throw new BadRequestException('Informe o CPF do prestador')
    }

    await this.ensureUniqueEmail(email)

    if (cpf) {
      await this.ensureUniqueCpf(cpf)
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: await hash(password, 8),
        role,
        status: UserStatus.ACTIVE,
      },
    })

    await this.audit.record({
      actorId,
      action:
        role === UserRole.ADMIN
          ? AUDIT_ACTIONS.ADMIN_CREATED
          : AUDIT_ACTIONS.USER_CREATED,
      entity: 'user',
      entityId: user.id,
      metadata: { role, email },
    })

    return omitPassword(user)
  }

  async update(actorId: string, id: string, dto: UpdateAdminUserDto) {
    const user = await this.getUserOrFail(id)

    const name = dto.name?.trim()
    const email = dto.email?.trim().toLowerCase()
    const cpf =
      dto.cpf === undefined
        ? undefined
        : dto.cpf
          ? dto.cpf.replace(/\D/g, '')
          : null

    if (name !== undefined && !name) {
      throw new BadRequestException('Informe o nome')
    }

    if (email !== undefined && !EMAIL_REGEX.test(email)) {
      throw new BadRequestException('Informe um e-mail válido')
    }

    if (user.role === UserRole.DOCTOR && cpf === null) {
      throw new BadRequestException('O CPF do prestador é obrigatório')
    }

    if (email && email !== user.email) {
      await this.ensureUniqueEmail(email, id)
    }

    if (cpf && cpf !== user.cpf) {
      await this.ensureUniqueCpf(cpf, id)
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(cpf !== undefined && { cpf }),
        update_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.USER_UPDATED,
      entity: 'user',
      entityId: id,
      metadata: {
        role: user.role,
        fields: [
          name !== undefined ? 'name' : null,
          email !== undefined ? 'email' : null,
          cpf !== undefined ? 'cpf' : null,
        ].filter(Boolean),
      },
    })

    return omitPassword(updated)
  }

  async updateStatus(actorId: string, id: string, status: UserStatus) {
    if (status !== UserStatus.ACTIVE && status !== UserStatus.INACTIVE) {
      throw new BadRequestException('Status inválido')
    }

    const user = await this.getUserOrFail(id)

    if (status === UserStatus.INACTIVE) {
      if (id === actorId) {
        throw new BadRequestException('Você não pode inativar o próprio acesso')
      }

      if (user.role === UserRole.ADMIN) {
        await this.ensureAnotherActiveAdmin(id)
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        update_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action:
        status === UserStatus.ACTIVE
          ? AUDIT_ACTIONS.USER_ACTIVATED
          : AUDIT_ACTIONS.USER_INACTIVATED,
      entity: 'user',
      entityId: id,
      metadata: { role: user.role },
    })

    return omitPassword(updated)
  }

  async resetPassword(actorId: string, id: string, password: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres')
    }

    const user = await this.getUserOrFail(id)

    await this.prisma.user.update({
      where: { id },
      data: {
        password: await hash(password, 8),
        update_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.USER_PASSWORD_RESET,
      entity: 'user',
      entityId: id,
      metadata: { role: user.role },
    })

    return { message: 'Senha atualizada com sucesso' }
  }

  private async getUserOrFail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return user
  }

  private async ensureUniqueEmail(email: string, ignoreId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Este e-mail já está em uso')
    }
  }

  private async ensureUniqueCpf(cpf: string, ignoreId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { cpf },
    })

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Este CPF já está em uso')
    }
  }

  private async ensureAnotherActiveAdmin(exceptId: string) {
    const remaining = await this.prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        id: { not: exceptId },
      },
    })

    if (remaining === 0) {
      throw new BadRequestException(
        'Não é possível inativar o último administrador ativo',
      )
    }
  }
}
