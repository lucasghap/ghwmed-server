import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/prima.service'
import { ROLES_KEY } from './roles.decorator'
import { USER_STATUSES, UserRoleValue } from './roles'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleValue[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.sub as string | undefined

    if (!userId) {
      throw new UnauthorizedException('Unathorized')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.status === USER_STATUSES.INACTIVE) {
      throw new UnauthorizedException('Unathorized')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso restrito a administradores')
    }

    return true
  }
}
