import {
  IntegrationResponseMode,
  IntegrationStatus,
  IntegrationType,
} from '@prisma/client'

export class CreateIntegrationDto {
  name: string
  type: IntegrationType
  provider?: string
  status?: IntegrationStatus
  url: string
  token?: string | null
  response?: IntegrationResponseMode | null
  separate_report?: boolean
  report_url?: string | null
  report_response?: IntegrationResponseMode | null
  ghapflow_integration?: boolean
  config?: Record<string, unknown>
}
