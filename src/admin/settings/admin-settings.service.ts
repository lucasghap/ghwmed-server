import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prima.service'
import { AUDIT_ACTIONS, AdminAuditService } from '../admin-audit.service'

@Injectable()
export class AdminSettingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async getSettings() {
    const settings = await this.getOrCreate()

    return {
      assist_enabled: settings.assist_enabled,
    }
  }

  async updateSettings(actorId: string, assistEnabled: boolean) {
    if (typeof assistEnabled !== 'boolean') {
      throw new BadRequestException('Informe se a assistência está habilitada')
    }

    const settings = await this.getOrCreate()

    const updated = await this.prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        assist_enabled: assistEnabled,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      entity: 'platform_settings',
      entityId: updated.id,
      metadata: {
        assist_enabled: assistEnabled,
      },
    })

    return {
      assist_enabled: updated.assist_enabled,
    }
  }

  async isAssistEnabled() {
    const settings = await this.prisma.platformSettings.findFirst({
      select: { assist_enabled: true },
    })

    return settings?.assist_enabled === true
  }

  private async getOrCreate() {
    const existing = await this.prisma.platformSettings.findFirst()

    if (existing) {
      return existing
    }

    return this.prisma.platformSettings.create({
      data: { id: 'default' },
    })
  }
}
