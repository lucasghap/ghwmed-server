import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserRoleValue } from '../roles'

export interface AuthUser {
  id: string
  email?: string
  role?: UserRoleValue
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest()

    const user = request.user

    return {
      id: user.sub,
      email: user.email,
      role: user.role,
    }
  },
)
