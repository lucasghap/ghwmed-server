import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  Integration,
  IntegrationResponseMode,
  IntegrationStatus,
  IntegrationType,
  Prisma,
} from '@prisma/client'
import { PrismaService } from 'src/prima.service'
import { AUDIT_ACTIONS, AdminAuditService } from '../admin-audit.service'
import { CreateIntegrationDto } from './dto/create-integration.dto'
import { ListIntegrationsDto } from './dto/list-integrations.dto'
import { UpdateIntegrationDto } from './dto/update-integration.dto'
import {
  INTEGRATION_PROVIDERS,
  INTEGRATION_RESPONSE_MODES,
  INTEGRATION_TYPES,
} from './integration.constants'

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

@Injectable()
export class AdminIntegrationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async list(query: ListIntegrationsDto) {
    const search = query.search?.trim()

    const where: Prisma.IntegrationWhereInput = {}

    if (query.type) {
      this.assertType(query.type)
      where.type = query.type
    }

    if (query.status) {
      this.assertStatus(query.status)
      where.status = query.status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ]
    }

    const integrations = await this.prisma.integration.findMany({
      where,
      orderBy: [{ type: 'asc' }, { created_at: 'desc' }],
    })

    return {
      data: integrations.map((item) => this.toPublic(item)),
    }
  }

  async findById(id: string) {
    return this.toPublic(await this.getOrFail(id))
  }

  async create(actorId: string, dto: CreateIntegrationDto) {
    const data = this.normalizePayload(dto, true)

    const integration = await this.prisma.integration.create({
      data,
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.INTEGRATION_CREATED,
      entity: 'integration',
      entityId: integration.id,
      metadata: {
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        token_configured: Boolean(integration.token),
      },
    })

    return this.toPublic(integration)
  }

  async update(actorId: string, id: string, dto: UpdateIntegrationDto) {
    const current = await this.getOrFail(id)
    const data = this.normalizePayload(
      { ...dto, type: current.type },
      false,
      current,
    )

    const integration = await this.prisma.integration.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.INTEGRATION_UPDATED,
      entity: 'integration',
      entityId: id,
      metadata: {
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        token_updated: dto.token !== undefined && Boolean(dto.token?.trim()),
      },
    })

    return this.toPublic(integration)
  }

  async updateStatus(actorId: string, id: string, status: IntegrationStatus) {
    this.assertStatus(status)
    await this.getOrFail(id)

    const integration = await this.prisma.integration.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action:
        status === IntegrationStatus.ACTIVE
          ? AUDIT_ACTIONS.INTEGRATION_ACTIVATED
          : AUDIT_ACTIONS.INTEGRATION_INACTIVATED,
      entity: 'integration',
      entityId: id,
      metadata: { type: integration.type, name: integration.name },
    })

    return this.toPublic(integration)
  }

  async remove(actorId: string, id: string) {
    const current = await this.getOrFail(id)

    await this.prisma.integration.delete({
      where: { id },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.INTEGRATION_DELETED,
      entity: 'integration',
      entityId: id,
      metadata: { type: current.type, name: current.name },
    })

    return { message: 'Integração removida com sucesso' }
  }

  private async getOrFail(id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    })

    if (!integration) {
      throw new NotFoundException('Integração não encontrada')
    }

    return integration
  }

  private normalizePayload(
    dto: CreateIntegrationDto | (UpdateIntegrationDto & { type: IntegrationType }),
    isCreate: boolean,
    current?: Integration,
  ) {
    const name = dto.name?.trim()
    const url = dto.url?.trim()
    const provider = (dto.provider?.trim() || current?.provider || 'custom').toLowerCase()
    const type = dto.type

    if (isCreate || dto.name !== undefined) {
      if (!name) {
        throw new BadRequestException('Informe o nome da integração')
      }
    }

    if (isCreate) {
      this.assertType(type)
    }

    if (isCreate || dto.url !== undefined) {
      if (!url || !isValidUrl(url)) {
        throw new BadRequestException('Informe uma URL válida')
      }
    }

    if (dto.provider !== undefined && !provider) {
      throw new BadRequestException('Informe o provedor da integração')
    }

    const response = this.normalizeResponse(dto.response, type, isCreate, current)
    const separateReport =
      type === IntegrationType.IMAGE_EXAM
        ? dto.separate_report ?? current?.separate_report ?? false
        : false

    let reportUrl = separateReport
      ? dto.report_url ?? current?.report_url ?? null
      : null
    let reportResponse = separateReport
      ? dto.report_response ?? current?.report_response ?? null
      : null

    if (separateReport) {
      const resolvedReportUrl = reportUrl?.trim() || ''

      if (!resolvedReportUrl || !isValidUrl(resolvedReportUrl)) {
        throw new BadRequestException('Informe uma URL válida para o laudo')
      }

      if (!reportResponse) {
        throw new BadRequestException('Informe o tipo de resposta do laudo')
      }

      this.assertResponse(reportResponse)
      reportUrl = resolvedReportUrl
    }

    const ghapflowIntegration =
      type === IntegrationType.LAB_EXAM ||
      (type === IntegrationType.IMAGE_EXAM && separateReport)
        ? Boolean(dto.ghapflow_integration ?? current?.ghapflow_integration)
        : false

    const token =
      dto.token === undefined
        ? undefined
        : dto.token?.trim()
          ? dto.token.trim()
          : current?.token ?? null

    return {
      ...(name !== undefined && { name }),
      ...(isCreate && { type }),
      provider: INTEGRATION_PROVIDERS.includes(
        provider as (typeof INTEGRATION_PROVIDERS)[number],
      )
        ? provider
        : provider || 'custom',
      ...(url !== undefined && { url }),
      ...(token !== undefined && { token }),
      response,
      separate_report: separateReport,
      report_url: reportUrl,
      report_response: reportResponse,
      ghapflow_integration: ghapflowIntegration,
      ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
    }
  }

  private normalizeResponse(
    value: IntegrationResponseMode | null | undefined,
    type: IntegrationType,
    isCreate: boolean,
    current?: Integration,
  ) {
    if (value === undefined) {
      if (isCreate) {
        return IntegrationResponseMode.OPEN_URL
      }

      return current?.response ?? IntegrationResponseMode.OPEN_URL
    }

    if (!value) {
      throw new BadRequestException('Informe o tipo de resposta da API')
    }

    this.assertResponse(value)
    return value
  }

  private toPublic(integration: Integration) {
    const { token, ...rest } = integration

    return {
      ...rest,
      has_token: Boolean(token && token.trim()),
    }
  }

  private assertType(type: IntegrationType) {
    if (!INTEGRATION_TYPES.includes(type)) {
      throw new BadRequestException('Tipo de integração inválido')
    }
  }

  private assertStatus(status: IntegrationStatus) {
    if (
      status !== IntegrationStatus.ACTIVE &&
      status !== IntegrationStatus.INACTIVE
    ) {
      throw new BadRequestException('Status inválido')
    }
  }

  private assertResponse(response: IntegrationResponseMode) {
    if (!INTEGRATION_RESPONSE_MODES.includes(response)) {
      throw new BadRequestException('Tipo de resposta inválido')
    }
  }
}
