import { IntegrationStatus, IntegrationType } from '@prisma/client'

export class ListIntegrationsDto {
  type?: IntegrationType
  status?: IntegrationStatus
  search?: string
}
