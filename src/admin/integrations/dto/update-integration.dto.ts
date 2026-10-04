import { CreateIntegrationDto } from './create-integration.dto'

export class UpdateIntegrationDto implements Partial<CreateIntegrationDto> {
  name?: string
  provider?: string
  url?: string
  token?: string | null
  response?: CreateIntegrationDto['response']
  separate_report?: boolean
  report_url?: string | null
  report_response?: CreateIntegrationDto['report_response']
  ghapflow_integration?: boolean
  config?: Record<string, unknown>
}
