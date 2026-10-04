import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prima.service'

export const AUDIT_ACTIONS = {
  ADMIN_CREATED: 'ADMIN_CREATED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_INACTIVATED: 'USER_INACTIVATED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  BRANDING_UPDATED: 'BRANDING_UPDATED',
  BRANDING_ASSET_UPDATED: 'BRANDING_ASSET_UPDATED',
  BRANDING_ASSET_REMOVED: 'BRANDING_ASSET_REMOVED',
  INTEGRATION_CREATED: 'INTEGRATION_CREATED',
  INTEGRATION_UPDATED: 'INTEGRATION_UPDATED',
  INTEGRATION_ACTIVATED: 'INTEGRATION_ACTIVATED',
  INTEGRATION_INACTIVATED: 'INTEGRATION_INACTIVATED',
  INTEGRATION_DELETED: 'INTEGRATION_DELETED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
} as const

interface RecordAuditInput {
  actorId: string
  action: string
  entity: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
}

@Injectable()
export class AdminAuditService {
  constructor(private prisma: PrismaService) {}

  async record({ actorId, action, entity, entityId, metadata }: RecordAuditInput) {
    await this.prisma.adminAuditLog.create({
      data: {
        actor_id: actorId,
        action,
        entity,
        entity_id: entityId ?? null,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue,
      },
    })
  }
}
