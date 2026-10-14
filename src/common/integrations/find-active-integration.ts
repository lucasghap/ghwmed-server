import { NotFoundException } from '@nestjs/common'
import { IntegrationStatus, IntegrationType } from '@prisma/client'
import { PrismaService } from 'src/prima.service'

export async function findActiveIntegration(
  prisma: PrismaService,
  type: IntegrationType,
) {
  const integration = await prisma.integration.findFirst({
    where: { type, status: IntegrationStatus.ACTIVE },
    orderBy: { created_at: 'desc' },
  })

  if (!integration) {
    throw new NotFoundException('Integração não configurada')
  }

  return {
    url: integration.url,
    response: integration.response,
    ghapflow_integration: integration.ghapflow_integration,
  }
}
